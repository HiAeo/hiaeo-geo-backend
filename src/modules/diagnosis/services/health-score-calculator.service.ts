import { Injectable } from '@nestjs/common';
import {
  HealthScoreResult,
  DimensionHealthScore,
  RiskFactor,
} from '../interfaces/diagnosis.interface';
import { ReportGrade } from '../entities/diagnosis-report.entity';

interface DiagnosisDimensionConfig {
  name: string;
  enabled?: boolean;
  weight?: number;
}

interface AIAnalysisResult {
  diagnosisId: string;
  brandName: string;
  overallScore: number;
  dimensionScores: {
    name: string;
    score: number;
    analysis: string;
    problems: string[];
  }[];
  suggestions: string[];
  issues: any[];
}

@Injectable()
export class HealthScoreCalculatorService {
  // 默认维度权重
  private readonly defaultWeights: Record<string, number> = {
    '技术SEO基础': 0.25,
    '内容质量与相关性': 0.25,
    '外部链接与权威性': 0.20,
    '用户体验': 0.15,
    '地理定位优化': 0.15,
  };

  /**
   * 计算健康分
   */
  calculate(
    aiResult: AIAnalysisResult,
    customDimensions?: DiagnosisDimensionConfig[],
  ): HealthScoreResult {
    // 1. 处理维度评分
    const dimensionScores = this.processDimensionScores(
      aiResult.dimensionScores,
      customDimensions,
    );

    // 2. 计算加权总分
    const overallScore = this.calculateWeightedScore(dimensionScores);

    // 3. 确定评级
    const grade = this.determineGrade(overallScore);

    // 4. 计算健康等级 (1-5)
    const healthLevel = this.calculateHealthLevel(overallScore);

    // 5. 识别风险因素
    const riskFactors = this.identifyRiskFactors(dimensionScores);

    // 6. 分析趋势
    this.analyzeTrends(dimensionScores);

    return {
      overallScore,
      grade,
      healthLevel,
      dimensionScores,
      riskFactors,
    };
  }

  /**
   * 处理维度评分
   */
  private processDimensionScores(
    rawScores: AIAnalysisResult['dimensionScores'],
    customDimensions?: DiagnosisDimensionConfig[],
  ): DimensionHealthScore[] {
    const customMap = new Map(
      customDimensions?.map((d) => [d.name, d]) || [],
    );

    return rawScores.map((dim) => {
      const custom = customMap.get(dim.name);
      const weight =
        custom?.weight || this.defaultWeights[dim.name] || 0.2;

      return {
        name: dim.name,
        score: dim.score,
        weight,
        analysis: dim.analysis,
        trend: 'stable', // 默认稳定，后续可基于历史数据更新
      };
    });
  }

  /**
   * 计算加权总分
   */
  private calculateWeightedScore(dimensions: DimensionHealthScore[]): number {
    if (dimensions.length === 0) return 0;

    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    
    if (totalWeight === 0) return 0;

    const weightedSum = dimensions.reduce(
      (sum, d) => sum + d.score * d.weight,
      0,
    );

    return Math.round(weightedSum / totalWeight);
  }

  /**
   * 确定评级
   */
  private determineGrade(score: number): ReportGrade {
    if (score >= 90) return ReportGrade.EXCELLENT;
    if (score >= 75) return ReportGrade.GOOD;
    if (score >= 60) return ReportGrade.FAIR;
    if (score >= 40) return ReportGrade.POOR;
    return ReportGrade.VERY_POOR;
  }

  /**
   * 计算健康等级 (1-5)
   */
  private calculateHealthLevel(score: number): number {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  }

  /**
   * 识别风险因素
   */
  private identifyRiskFactors(dimensions: DimensionHealthScore[]): RiskFactor[] {
    const factors: RiskFactor[] = [];

    for (const dim of dimensions) {
      if (dim.score < 50) {
        factors.push({
          dimension: dim.name,
          risk: `${dim.name}得分过低(${dim.score}分)`,
          severity: dim.score < 30 ? 'critical' : dim.score < 40 ? 'high' : 'medium',
          recommendation: this.getRecommendation(dim.name, dim.score),
        });
      }
    }

    // 按严重程度排序
    return factors.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * 获取推荐建议
   */
  private getRecommendation(dimension: string, score: number): string {
    const recommendations: Record<string, string> = {
      '技术SEO基础':
        '建议进行技术SEO审计，检查网站结构、页面速度、移动端适配等技术因素',
      '内容质量与相关性':
        '建议增加原创深度内容，优化关键词布局，提升内容价值',
      '外部链接与权威性':
        '建议积极建设高质量外链，获取行业权威网站的推荐',
      '用户体验':
        '建议优化网站导航结构，提升页面加载速度，改善移动端体验',
      '地理定位优化':
        '建议完善地理标签，增加本地化内容，优化Google Earth相关展示',
    };

    return recommendations[dimension] || '建议进行全面诊断以确定具体问题';
  }

  /**
   * 分析趋势
   */
  private analyzeTrends(dimensions: DimensionHealthScore[]): void {
    // 趋势分析需要历史数据支持
    // 这里简化处理，实际应用中应从数据库获取历史评分进行比较
    for (const dim of dimensions) {
      if (dim.score >= 80) {
        dim.trend = 'stable';
      } else if (dim.score < 60) {
        dim.trend = 'down';
      } else {
        dim.trend = 'stable';
      }
    }
  }

  /**
   * 计算改进潜力
   */
  calculateImprovementPotential(
    currentScore: number,
    targetScore: number,
  ): {
    improvementNeeded: number;
    estimatedEffort: 'low' | 'medium' | 'high';
    priorityDimensions: string[];
  } {
    const improvementNeeded = targetScore - currentScore;
    
    let estimatedEffort: 'low' | 'medium' | 'high';
    if (improvementNeeded <= 5) {
      estimatedEffort = 'low';
    } else if (improvementNeeded <= 15) {
      estimatedEffort = 'medium';
    } else {
      estimatedEffort = 'high';
    }

    return {
      improvementNeeded,
      estimatedEffort,
      priorityDimensions: [], // 实际应基于问题分析确定
    };
  }

  /**
   * 导出健康报告数据
   */
  exportReportData(result: HealthScoreResult): Record<string, any> {
    return {
      overallScore: result.overallScore,
      grade: result.grade,
      healthLevel: result.healthLevel,
      dimensionBreakdown: result.dimensionScores.map((d) => ({
        name: d.name,
        score: d.score,
        weight: d.weight,
        contribution: Math.round(d.score * d.weight),
        trend: d.trend,
      })),
      riskSummary: {
        total: result.riskFactors.length,
        critical: result.riskFactors.filter((r) => r.severity === 'critical').length,
        high: result.riskFactors.filter((r) => r.severity === 'high').length,
        medium: result.riskFactors.filter((r) => r.severity === 'medium').length,
      },
    };
  }
}
