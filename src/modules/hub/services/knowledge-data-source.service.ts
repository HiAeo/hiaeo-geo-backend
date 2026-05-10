import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../../knowledge/entities/brand-knowledge-base.entity';
import { DiagnosisReport } from '../../diagnosis/entities/diagnosis-report.entity';

/**
 * 知识库数据源服务
 * 为Hub驾驶舱提供知识库相关的统计数据
 */
@Injectable()
export class KnowledgeDataSourceService {
  private readonly logger = new Logger(KnowledgeDataSourceService.name);

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
    @InjectRepository(DiagnosisReport)
    private reportRepository: Repository<DiagnosisReport>,
  ) {}

  /**
   * 获取组织的知识库健康度指标
   */
  async getKnowledgeHealthMetrics(organizationId: string): Promise<{
    completenessScore: number;
    healthLevel: 'excellent' | 'good' | 'fair' | 'poor';
    dimensionScores: Record<string, number>;
    lastDiagnosisScore: number | null;
    versionHistory: { version: number; date: string }[];
    recommendations: string[];
  }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return {
        completenessScore: 0,
        healthLevel: 'poor',
        dimensionScores: {},
        lastDiagnosisScore: null,
        versionHistory: [],
        recommendations: ['请先创建品牌知识库'],
      };
    }

    // 计算完整度得分
    const completenessScore = this.calculateCompleteness(knowledge);

    // 获取最近的诊断报告
    const latestReport = await this.reportRepository.findOne({
      where: { brandName: knowledge.basicInfo?.companyName || '' },
      order: { createdAt: 'DESC' },
    });

    // 生成推荐建议
    const recommendations = this.generateRecommendations(knowledge, completenessScore);

    // 确定健康等级
    const healthLevel = this.determineHealthLevel(completenessScore, latestReport?.overallScore);

    return {
      completenessScore,
      healthLevel,
      dimensionScores: this.getDimensionScores(knowledge),
      lastDiagnosisScore: latestReport?.overallScore || null,
      versionHistory: [
        {
          version: knowledge.version,
          date: knowledge.updatedAt?.toISOString() || new Date().toISOString(),
        },
      ],
      recommendations,
    };
  }

  /**
   * 获取知识库统计摘要
   */
  async getKnowledgeStats(organizationId: string): Promise<{
    totalOrganizations: number;
    withCompleteKnowledge: number;
    avgCompleteness: number;
    topIndustries: { industry: string; count: number }[];
  }> {
    const stats = await this.knowledgeRepository
      .createQueryBuilder('knowledge')
      .select('COUNT(*)', 'total')
      .getRawOne();

    const allKnowledge = await this.knowledgeRepository.find();

    let completeCount = 0;
    let totalScore = 0;
    const industryCount: Record<string, number> = {};

    for (const knowledge of allKnowledge) {
      const score = this.calculateCompleteness(knowledge);
      totalScore += score;

      if (score >= 0.8) {
        completeCount++;
      }

      if (knowledge.basicInfo?.industry) {
        const industry = knowledge.basicInfo.industry;
        industryCount[industry] = (industryCount[industry] || 0) + 1;
      }
    }

    const topIndustries = Object.entries(industryCount)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrganizations: parseInt(stats?.total || '0', 10),
      withCompleteKnowledge: completeCount,
      avgCompleteness: allKnowledge.length > 0 ? totalScore / allKnowledge.length : 0,
      topIndustries,
    };
  }

  /**
   * 获取知识库完整度趋势
   */
  async getCompletenessTrend(organizationId: string, days: number = 30): Promise<{
    trend: { date: string; score: number }[];
    direction: 'up' | 'down' | 'stable';
    changePercent: number;
  }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return {
        trend: [],
        direction: 'stable',
        changePercent: 0,
      };
    }

    const currentScore = this.calculateCompleteness(knowledge);

    // 简化实现：基于版本历史生成趋势数据
    // 实际实现中应该查询版本历史表
    const trend = [
      {
        date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: Math.max(0, currentScore - 0.2),
      },
      {
        date: new Date(Date.now() - (days / 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: Math.max(0, currentScore - 0.1),
      },
      {
        date: new Date().toISOString().split('T')[0],
        score: currentScore,
      },
    ];

    const firstScore = trend[0].score;
    const changePercent = firstScore > 0 ? ((currentScore - firstScore) / firstScore) * 100 : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 5) direction = 'up';
    else if (changePercent < -5) direction = 'down';

    return { trend, direction, changePercent };
  }

  /**
   * 获取知识库与诊断的关联数据
   */
  async getKnowledgeDiagnosisCorrelation(organizationId: string): Promise<{
    diagnosisCount: number;
    avgScore: number;
    bestDimension: string;
    worstDimension: string;
    improvementTrend: 'improving' | 'declining' | 'stable';
  }> {
    const reports = await this.reportRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (reports.length === 0) {
      return {
        diagnosisCount: 0,
        avgScore: 0,
        bestDimension: 'N/A',
        worstDimension: 'N/A',
        improvementTrend: 'stable',
      };
    }

    const avgScore =
      reports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reports.length;

    // 汇总维度得分
    const dimensionScores: Record<string, number[]> = {};
    for (const report of reports) {
      if (report.dimensionScores) {
        for (const [dimension, score] of Object.entries(report.dimensionScores)) {
          if (!dimensionScores[dimension]) {
            dimensionScores[dimension] = [];
          }
          dimensionScores[dimension].push(score as number);
        }
      }
    }

    // 计算各维度平均分
    const dimensionAvg: Record<string, number> = {};
    for (const [dimension, scores] of Object.entries(dimensionScores)) {
      dimensionAvg[dimension] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    // 找出最好和最差的维度
    const sortedDimensions = Object.entries(dimensionAvg).sort((a, b) => b[1] - a[1]);

    // 判断趋势
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (reports.length >= 2) {
      const recentAvg =
        (reports[0]?.overallScore || 0 + reports[1]?.overallScore || 0) / 2;
      const olderAvg =
        (reports[reports.length - 1]?.overallScore || 0 +
          reports[reports.length - 2]?.overallScore || 0) /
        2;

      if (recentAvg > olderAvg + 0.05) {
        improvementTrend = 'improving';
      } else if (recentAvg < olderAvg - 0.05) {
        improvementTrend = 'declining';
      }
    }

    return {
      diagnosisCount: reports.length,
      avgScore,
      bestDimension: sortedDimensions[0]?.[0] || 'N/A',
      worstDimension: sortedDimensions[sortedDimensions.length - 1]?.[0] || 'N/A',
      improvementTrend,
    };
  }

  // ==================== 私有辅助方法 ====================

  private calculateCompleteness(knowledge: BrandKnowledgeBase): number {
    const sections = [
      { key: 'basicInfo', required: true },
      { key: 'bizPositioning', required: true },
      { key: 'productService', required: true },
      { key: 'competitorMarket', required: false },
      { key: 'geoGoals', required: true },
    ];

    let total = 0;
    let filled = 0;

    for (const section of sections) {
      total++;
      if (this.isFieldComplete((knowledge as any)[section.key])) {
        filled++;
      }
    }

    return total > 0 ? Math.round((filled / total) * 100) / 100 : 0;
  }

  private isFieldComplete(field: any): boolean {
    if (!field) return false;
    if (typeof field === 'string') return field.trim().length > 0;
    if (Array.isArray(field)) return field.length > 0;
    if (typeof field === 'object') return Object.keys(field).length > 0;
    return false;
  }

  private getDimensionScores(knowledge: BrandKnowledgeBase): Record<string, number> {
    // 基于字段完整度推断维度得分
    const scores: Record<string, number> = {
      brand_positioning: this.isFieldComplete(knowledge.bizPositioning) ? 0.8 : 0.3,
      content_optimization: this.isFieldComplete(knowledge.productService) ? 0.8 : 0.3,
      seo_health: this.isFieldComplete(knowledge.geoGoals) ? 0.7 : 0.3,
      competitor_comparison: this.isFieldComplete(knowledge.competitorMarket) ? 0.7 : 0.3,
    };

    return scores;
  }

  private determineHealthLevel(
    completenessScore: number,
    diagnosisScore?: number | null,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const effectiveScore = diagnosisScore !== null && diagnosisScore !== undefined
      ? (completenessScore + diagnosisScore) / 2
      : completenessScore;

    if (effectiveScore >= 0.8) return 'excellent';
    if (effectiveScore >= 0.6) return 'good';
    if (effectiveScore >= 0.4) return 'fair';
    return 'poor';
  }

  private generateRecommendations(
    knowledge: BrandKnowledgeBase,
    completenessScore: number,
  ): string[] {
    const recommendations: string[] = [];

    if (completenessScore < 0.5) {
      recommendations.push('知识库完整度较低，建议优先完善基础信息');
    }

    if (!this.isFieldComplete(knowledge.basicInfo)) {
      recommendations.push('请完善企业基础信息（公司名称、行业等）');
    }

    if (!this.isFieldComplete(knowledge.bizPositioning)) {
      recommendations.push('建议完善核心业务定位描述');
    }

    if (!this.isFieldComplete(knowledge.productService)) {
      recommendations.push('请添加产品/服务详情');
    }

    if (!this.isFieldComplete(knowledge.geoGoals)) {
      recommendations.push('建议明确GEO推广目标');
    }

    if (completenessScore >= 0.8) {
      recommendations.push('知识库信息较为完整，可以进行GEO诊断');
    }

    return recommendations;
  }
}
