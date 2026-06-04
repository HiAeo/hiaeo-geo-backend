import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimizationSuggestion, SuggestionStatus, SuggestionCategory, SuggestionPriority } from '../entities/optimization-suggestion.entity';
import { Competitor } from '../entities/competitor.entity';
import { OptimizationExecution } from '../entities/optimization-execution.entity';

/**
 * 优化持久化服务
 * 负责将诊断结果和建议持久化到数据库
 */
@Injectable()
export class OptimizationPersistenceService {
  private readonly logger = new Logger(OptimizationPersistenceService.name);

  constructor(
    @InjectRepository(OptimizationSuggestion)
    private suggestionRepository: Repository<OptimizationSuggestion>,
    @InjectRepository(Competitor)
    private competitorRepository: Repository<Competitor>,
    @InjectRepository(OptimizationExecution)
    private executionRepository: Repository<OptimizationExecution>,
  ) {}

  /**
   * 保存诊断生成的优化建议
   */
  async saveDiagnosisSuggestions(
    reportId: string,
    brandId: string,
    suggestions: Array<{
      title: string;
      description: string;
      category: string;
      priority: string;
      actionPlan?: string;
      expectedOutcome?: string;
    }>,
  ): Promise<OptimizationSuggestion[]> {
    const savedSuggestions: OptimizationSuggestion[] = [];

    for (const suggestion of suggestions) {
      const entity = this.suggestionRepository.create({
        brandId,
        diagnosisReportId: reportId,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category as SuggestionCategory,
        priority: suggestion.priority as SuggestionPriority,
        actionPlan: suggestion.actionPlan,
        expectedOutcome: suggestion.expectedOutcome,
        status: SuggestionStatus.PENDING,
        progress: 0,
      });

      const saved = await this.suggestionRepository.save(entity);
      savedSuggestions.push(saved as OptimizationSuggestion);
    }

    this.logger.log(`保存了 ${savedSuggestions.length} 条优化建议 for report ${reportId}`);
    return savedSuggestions;
  }

  /**
   * 保存竞品数据
   */
  async saveCompetitorData(
    brandName: string,
    competitorData: Array<{
      competitorName: string;
      competitorWebsite?: string;
      suppressionScore?: number;
      rankingData?: any;
      contentAnalysis?: any;
    }>,
  ): Promise<Competitor[]> {
    const savedCompetitors: Competitor[] = [];

    for (const data of competitorData) {
      // 检查是否已存在
      const existing = await this.competitorRepository.findOne({
        where: { brandName, competitorName: data.competitorName },
      });

      if (existing) {
        // 更新现有记录
        existing.suppressionScore = data.suppressionScore || existing.suppressionScore;
        existing.rankingData = data.rankingData || existing.rankingData;
        existing.contentAnalysis = data.contentAnalysis || existing.contentAnalysis;
        existing.lastTrackedAt = new Date();
        existing.trackingCount += 1;
        
        const updated = await this.competitorRepository.save(existing);
        savedCompetitors.push(updated);
      } else {
        // 创建新记录
        const entity = this.competitorRepository.create({
          brandName,
          competitorName: data.competitorName,
          competitorWebsite: data.competitorWebsite,
          suppressionScore: data.suppressionScore || 50,
          rankingData: data.rankingData,
          contentAnalysis: data.contentAnalysis,
          isTracked: false,
          trackingCount: 1,
          lastTrackedAt: new Date(),
        });

        const saved = await this.competitorRepository.save(entity);
        savedCompetitors.push(saved);
      }
    }

    this.logger.log(`保存了 ${savedCompetitors.length} 个竞品 for brand ${brandName}`);
    return savedCompetitors;
  }

  /**
   * 保存执行记录
   */
  async saveExecutionRecord(
    suggestionId: string,
    brandId: string,
    executionData: {
      status: string;
      result?: any;
      metrics?: any;
    },
  ): Promise<OptimizationExecution> {
    const entity = this.executionRepository.create({
      suggestionId,
      brandId,
      status: executionData.status as any,
      result: executionData.result,
      metrics: executionData.metrics,
      executedAt: new Date(),
    });

    const saved = await this.executionRepository.save(entity);
    this.logger.log(`保存执行记录 ${saved.id} for suggestion ${suggestionId}`);
    return saved;
  }

  /**
   * 更新建议状态
   */
  async updateSuggestionStatus(
    suggestionId: string,
    status: string,
    progress?: number,
  ): Promise<void> {
    const update: Partial<OptimizationSuggestion> = { status: status as SuggestionStatus };
    if (progress !== undefined) {
      update.progress = progress;
    }
    await this.suggestionRepository.update(suggestionId, update);
  }

  /**
   * 获取品牌的优化建议统计
   */
  async getSuggestionStats(brandId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    byCategory: Record<string, number>;
  }> {
    const suggestions = await this.suggestionRepository.find({
      where: { brandId },
    });

    const stats = {
      total: suggestions.length,
      pending: 0,
      completed: 0,
      byCategory: {} as Record<string, number>,
    };

    for (const s of suggestions) {
      if (s.status === 'pending') stats.pending++;
      if (s.status === 'completed') stats.completed++;
      stats.byCategory[s.category] = (stats.byCategory[s.category] || 0) + 1;
    }

    return stats;
  }
}
