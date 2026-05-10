import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { DiagnosisTaskService } from '../../diagnosis/services/diagnosis-task.service';
import { DiagnosisType, DiagnosisStatus } from '../../diagnosis/entities/diagnosis-task.entity';
import { EmbeddingService } from './embedding.service';

/**
 * 增量诊断触发器
 * 监听知识库变更，自动触发增量诊断
 */
@Injectable()
export class IncrementalDiagnosisTriggerService {
  private readonly logger = new Logger(IncrementalDiagnosisTriggerService.name);

  // 触发增量诊断的变更阈值
  private readonly SIGNIFICANCE_THRESHOLD = 0.3; // 30% 内容变化触发

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
    private diagnosisTaskService: DiagnosisTaskService,
    private embeddingService: EmbeddingService,
  ) {}

  /**
   * 检查知识库变更是否需要触发增量诊断
   */
  async checkAndTrigger(
    organizationId: string,
    changedFields: string[],
    oldData: any,
    newData: any,
    userId: string,
  ): Promise<{ shouldTrigger: boolean; reason: string; taskId?: string }> {
    // 计算变更显著性
    const significance = this.calculateChangeSignificance(
      changedFields,
      oldData,
      newData,
    );

    this.logger.log(
      `知识库变更分析 - org: ${organizationId}, fields: ${changedFields.join(', ')}, significance: ${significance.toFixed(2)}`,
    );

    // 判断是否需要触发
    if (significance < this.SIGNIFICANCE_THRESHOLD) {
      return {
        shouldTrigger: false,
        reason: `变更显著性 (${significance.toFixed(2)}) 低于阈值 (${this.SIGNIFICANCE_THRESHOLD})`,
      };
    }

    // 检查是否满足触发条件
    const triggerReasons = this.getTriggerReasons(changedFields);

    if (triggerReasons.length === 0) {
      return {
        shouldTrigger: false,
        reason: '变更字段不属于关键诊断维度',
      };
    }

    // 创建增量诊断任务
    const task = await this.createIncrementalDiagnosisTask(
      organizationId,
      userId,
      triggerReasons,
      changedFields,
    );

    return {
      shouldTrigger: true,
      reason: `检测到关键维度变更: ${triggerReasons.join(', ')}`,
      taskId: task.id,
    };
  }

  /**
   * 手动触发增量诊断
   */
  async manualTrigger(
    organizationId: string,
    userId: string,
    dimensions?: string[],
  ): Promise<string> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      throw new Error('未找到知识库');
    }

    const defaultDimensions = dimensions || [
      'brand_positioning',
      'content_optimization',
      'seo_health',
      'competitor_comparison',
    ];

    const task = await this.diagnosisTaskService.createTask(userId, {
      brandName: knowledge.basicInfo?.companyName || '未命名品牌',
      website: knowledge.basicInfo?.website,
      industry: knowledge.basicInfo?.industry,
      type: 'quick' as any,
      dimensions: defaultDimensions.map(d => ({ dimension: d, enabled: true })) as any,
      includeCompetitorAnalysis: true,
      competitors: knowledge.competitorMarket?.competitors?.map((c: any) => c.competitorName),
    });

    // 更新知识库的最后诊断时间
    knowledge.lastDiagnosisRefresh = new Date();
    await this.knowledgeRepository.save(knowledge);

    this.logger.log(`手动触发增量诊断 - taskId: ${task.id}, org: ${organizationId}`);

    return task.id;
  }

  /**
   * 计算变更显著性
   */
  private calculateChangeSignificance(
    changedFields: string[],
    oldData: any,
    newData: any,
  ): number {
    // 关键字段权重
    const fieldWeights: Record<string, number> = {
      bizPositioning: 0.4, // 核心定位权重最高
      productService: 0.3,
      competitorMarket: 0.2,
      geoGoals: 0.2,
      basicInfo: 0.1,
      supplement: 0.05,
    };

    let totalSignificance = 0;

    for (const field of changedFields) {
      const weight = fieldWeights[field] || 0.1;
      const oldFieldData = oldData?.[field];
      const newFieldData = newData?.[field];

      // 计算字段内容变化程度
      const fieldChange = this.calculateFieldChange(oldFieldData, newFieldData);
      totalSignificance += weight * fieldChange;
    }

    // 归一化到 0-1
    return Math.min(1, totalSignificance);
  }

  /**
   * 计算单个字段的变化程度
   */
  private calculateFieldChange(oldData: any, newData: any): number {
    if (!oldData && !newData) return 0;
    if (!oldData || !newData) return 1;

    const oldText = JSON.stringify(oldData);
    const newText = JSON.stringify(newData);

    if (oldText === newText) return 0;

    // 使用简单的字符差异比率
    const maxLen = Math.max(oldText.length, newText.length);
    const diff = this.levenshteinDistance(oldText, newText);

    return Math.min(1, diff / maxLen);
  }

  /**
   * Levenshtein 距离计算
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1,
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * 获取触发诊断的原因
   */
  private getTriggerReasons(changedFields: string[]): string[] {
    const reasonMap: Record<string, string> = {
      bizPositioning: '核心定位变更',
      productService: '产品服务更新',
      competitorMarket: '竞品信息变化',
      geoGoals: '推广目标调整',
    };

    return changedFields
      .filter((field) => reasonMap[field])
      .map((field) => reasonMap[field]);
  }

  /**
   * 创建增量诊断任务
   */
  private async createIncrementalDiagnosisTask(
    organizationId: string,
    userId: string,
    triggerReasons: string[],
    changedFields: string[],
  ): Promise<any> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    // 确定诊断维度
    const dimensions = this.mapFieldsToDimensions(changedFields);

    // 构建诊断任务
    const task = await this.diagnosisTaskService.createTask(userId, {
      brandName: knowledge?.basicInfo?.companyName || '未命名品牌',
      website: knowledge?.basicInfo?.website,
      industry: knowledge?.basicInfo?.industry,
      type: 'quick' as any,
      dimensions: dimensions.map(d => ({ dimension: d, enabled: true })) as any,
      includeCompetitorAnalysis: changedFields.includes('competitorMarket'),
      competitors: knowledge?.competitorMarket?.competitors?.map((c: any) => c.competitorName),
    });

    // 更新知识库的最后诊断时间
    if (knowledge) {
      knowledge.lastDiagnosisRefresh = new Date();
      await this.knowledgeRepository.save(knowledge);
    }

    this.logger.log(
      `增量诊断任务已创建 - taskId: ${task.id}, reasons: ${triggerReasons.join(', ')}`,
    );

    return task;
  }

  /**
   * 将变更字段映射到诊断维度
   */
  private mapFieldsToDimensions(fields: string[]): string[] {
    const mapping: Record<string, string[]> = {
      bizPositioning: ['brand_positioning', 'content_optimization'],
      productService: ['content_optimization', 'seo_health'],
      competitorMarket: ['competitor_comparison'],
      geoGoals: ['geo_strategy', 'content_optimization'],
      basicInfo: ['brand_positioning'],
      supplement: [],
    };

    const dimensions = new Set<string>();
    for (const field of fields) {
      const mapped = mapping[field] || [];
      mapped.forEach((d) => dimensions.add(d));
    }

    return Array.from(dimensions);
  }

  /**
   * 检查是否需要建议用户进行增量诊断
   */
  async shouldSuggestDiagnosis(organizationId: string): Promise<{
    shouldSuggest: boolean;
    reason?: string;
    lastDiagnosisAge?: number;
  }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return { shouldSuggest: false, reason: '未找到知识库' };
    }

    // 检查是否有未诊断的关键信息
    const completeness = this.calculateCompleteness(knowledge);
    const criticalMissing = completeness.critical < 0.5;

    // 检查距离上次诊断的时间
    const daysSinceLastDiagnosis = knowledge.lastDiagnosisRefresh
      ? Math.floor(
          (Date.now() - new Date(knowledge.lastDiagnosisRefresh).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 999;

    if (daysSinceLastDiagnosis > 30) {
      return {
        shouldSuggest: true,
        reason: '距离上次诊断已超过30天，建议重新诊断以获取最新建议',
        lastDiagnosisAge: daysSinceLastDiagnosis,
      };
    }

    if (criticalMissing) {
      return {
        shouldSuggest: true,
        reason: `关键信息完整度仅${(completeness.critical * 100).toFixed(0)}%，建议完善后进行诊断`,
        lastDiagnosisAge: daysSinceLastDiagnosis,
      };
    }

    return { shouldSuggest: false };
  }

  /**
   * 计算知识库完整度
   */
  private calculateCompleteness(knowledge: BrandKnowledgeBase): {
    overall: number;
    critical: number;
    details: Record<string, number>;
  } {
    const fields = [
      { key: 'basicInfo', critical: true },
      { key: 'bizPositioning', critical: true },
      { key: 'productService', critical: true },
      { key: 'competitorMarket', critical: false },
      { key: 'geoGoals', critical: true },
      { key: 'supplement', critical: false },
    ];

    const details: Record<string, number> = {};
    let criticalFilled = 0;
    let criticalCount = 0;
    let totalFilled = 0;
    let totalCount = fields.length;

    for (const field of fields) {
      const data = (knowledge as any)[field.key];
      const filled = this.isFieldFilled(data);
      details[field.key] = filled ? 1 : 0;

      if (filled) {
        totalFilled++;
        if (field.critical) {
          criticalFilled++;
        }
      }
      if (field.critical) {
        criticalCount++;
      }
    }

    return {
      overall: totalFilled / totalCount,
      critical: criticalCount > 0 ? criticalFilled / criticalCount : 1,
      details,
    };
  }

  /**
   * 检查字段是否已填写
   */
  private isFieldFilled(data: any): boolean {
    if (!data) return false;
    if (typeof data === 'string') return data.trim().length > 0;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.keys(data).length > 0;
    return false;
  }
}
