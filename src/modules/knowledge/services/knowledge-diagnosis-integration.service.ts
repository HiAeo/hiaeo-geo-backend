import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { DiagnosisTaskService } from '../../diagnosis/services/diagnosis-task.service';
import { DiagnosisReport } from '../../diagnosis/entities/diagnosis-report.entity';
import { ReportGeneratorService } from '../../diagnosis/services/report-generator.service';

/**
 * 知识库与诊断模块对接服务
 * 实现双向联动：诊断结果 → 知识库评估 / 知识库变更 → 诊断触发
 */
@Injectable()
export class KnowledgeDiagnosisIntegrationService {
  private readonly logger = new Logger(KnowledgeDiagnosisIntegrationService.name);

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
    @Inject(forwardRef(() => DiagnosisTaskService))
    private diagnosisTaskService: DiagnosisTaskService,
    @InjectRepository(DiagnosisReport)
    private reportRepository: Repository<DiagnosisReport>,
  ) {}

  /**
   * 基于最新诊断报告更新知识库评估
   * 诊断完成后调用此方法，更新知识库的健康度评分
   */
  async updateKnowledgeFromDiagnosis(
    organizationId: string,
    reportId: string,
  ): Promise<{ updated: boolean; insights: string[] }> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      this.logger.warn(`诊断报告不存在: ${reportId}`);
      return { updated: false, insights: [] };
    }

    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return { updated: false, insights: [] };
    }

    // 从诊断报告中提取关键洞察
    const insights = this.extractInsightsFromReport(report);

    // 更新知识库的最后诊断信息
    knowledge.lastDiagnosisRefresh = new Date();
    knowledge.lastDiagnosisScore = report.overallScore || 0;
    knowledge.lastDiagnosisGrade = report.grade || 'N';
    knowledge.lastDiagnosisReportId = reportId;

    // 存储诊断洞察到补充信息中
    if (!knowledge.supplement) {
      knowledge.supplement = {};
    }
    knowledge.supplement.lastDiagnosisInsights = insights;

    await this.knowledgeRepository.save(knowledge);

    this.logger.log(
      `知识库诊断信息已更新 - org: ${organizationId}, score: ${report.overallScore}`,
    );

    return { updated: true, insights };
  }

  /**
   * 从诊断报告中提取关键洞察
   */
  private extractInsightsFromReport(report: any): string[] {
    const insights: string[] = [];

    // 从问题中提取关键洞察
    if (report.issues && Array.isArray(report.issues)) {
      const criticalIssues = report.issues
        .filter((issue: any) => issue.severity === 'high' || issue.severity === 'critical')
        .slice(0, 3);

      criticalIssues.forEach((issue: any) => {
        insights.push(`问题: ${issue.title} - ${issue.description}`);
      });
    }

    // 从建议中提取关键建议
    if (report.suggestions && Array.isArray(report.suggestions)) {
      report.suggestions
        .slice(0, 3)
        .forEach((suggestion: any) => {
          insights.push(`建议: ${suggestion.content || suggestion}`);
        });
    }

    // 从AI洞察中提取
    if (report.aiInsights && Array.isArray(report.aiInsights)) {
      report.aiInsights
        .slice(0, 2)
        .forEach((insight: any) => {
          insights.push(`洞察: ${insight}`);
        });
    }

    return insights;
  }

  /**
   * 获取诊断关联的知识库信息摘要
   * 用于诊断详情页面展示
   */
  async getKnowledgeSummaryForDiagnosis(
    organizationId: string,
  ): Promise<{
    version: number;
    lastUpdate: string;
    completenessScore: number;
    keyFields: { name: string; status: string }[];
    forbiddenWords?: string[];
  } | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return null;
    }

    // 计算关键字段状态
    const keyFields = [
      { name: '企业基础信息', status: this.isFieldComplete(knowledge.basicInfo) ? 'complete' : 'incomplete' },
      { name: '核心业务定位', status: this.isFieldComplete(knowledge.bizPositioning) ? 'complete' : 'incomplete' },
      { name: '产品服务详情', status: this.isFieldComplete(knowledge.productService) ? 'complete' : 'incomplete' },
      { name: '竞品市场信息', status: this.isFieldComplete(knowledge.competitorMarket) ? 'complete' : 'incomplete' },
      { name: 'GEO推广目标', status: this.isFieldComplete(knowledge.geoGoals) ? 'complete' : 'incomplete' },
    ];

    // 计算完整度得分
    const completenessScore = this.calculateCompleteness(knowledge);

    // 提取禁忌词
    const forbiddenWords = knowledge.supplement?.brandForbiddenWords
      ? knowledge.supplement.brandForbiddenWords.split(/[,，]/).filter(Boolean)
      : undefined;

    return {
      version: knowledge.version,
      lastUpdate: knowledge.updatedAt?.toISOString?.() || String(knowledge.updatedAt),
      completenessScore,
      keyFields,
      forbiddenWords,
    };
  }

  /**
   * 检查诊断是否应该自动触发
   * 基于知识库变更程度和诊断历史
   */
  async shouldAutoTriggerDiagnosis(
    organizationId: string,
    changedFields: string[],
  ): Promise<{ shouldTrigger: boolean; reason: string; confidence: number }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return { shouldTrigger: false, reason: '未找到知识库', confidence: 0 };
    }

    // 检查关键字段变更
    const criticalFields = ['bizPositioning', 'productService', 'competitorMarket'];
    const criticalChanged = changedFields.filter((f) => criticalFields.includes(f));

    if (criticalChanged.length === 0) {
      return { shouldTrigger: false, reason: '无关键字段变更', confidence: 0.3 };
    }

    // 检查距离上次诊断的时间
    if (knowledge.lastDiagnosisRefresh) {
      const daysSinceLastDiagnosis = Math.floor(
        (Date.now() - new Date(knowledge.lastDiagnosisRefresh).getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastDiagnosis < 7) {
        return {
          shouldTrigger: false,
          reason: `距离上次诊断仅${daysSinceLastDiagnosis}天，建议稍后再诊断`,
          confidence: 0.5,
        };
      }
    }

    // 计算变更显著性
    const significance = this.calculateChangeSignificance(changedFields);

    if (significance < 0.3) {
      return { shouldTrigger: false, reason: '变更幅度较小', confidence: significance };
    }

    return {
      shouldTrigger: true,
      reason: `检测到关键维度变更: ${criticalChanged.join(', ')}`,
      confidence: significance,
    };
  }

  /**
   * 计算变更显著性
   */
  private calculateChangeSignificance(fields: string[]): number {
    const weights: Record<string, number> = {
      bizPositioning: 0.4,
      productService: 0.3,
      competitorMarket: 0.2,
      geoGoals: 0.15,
      basicInfo: 0.1,
    };

    return fields.reduce((sum, field) => sum + (weights[field] || 0.1), 0);
  }

  /**
   * 检查字段是否完整
   */
  private isFieldComplete(field: any): boolean {
    if (!field) return false;
    if (typeof field === 'string') return field.trim().length > 0;
    if (Array.isArray(field)) return field.length > 0;
    if (typeof field === 'object') return Object.keys(field).length > 0;
    return false;
  }

  /**
   * 计算知识库完整度
   */
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

    return total > 0 ? filled / total : 0;
  }
}
