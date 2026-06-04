import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../brand/entities/brand.entity';
import { Content } from '../content/entities/content.entity';
import { WorkflowStateService } from '../workflow-state/workflow-state.service';
import { ModuleState } from '../brand/entities/brand.entity';
import {
  OptimizationType,
  OptimizationPriority,
  OptimizationStatus,
  OptimizationSuggestion,
  MonitorData,
  EffectTracking,
  OptimizationAnalysis,
} from './interfaces/optimization.interface';

/**
 * 自动优化建议服务
 * 基于监控数据自动生成优化建议并执行
 */
@Injectable()
export class OptimizationService {
  private readonly logger = new Logger(OptimizationService.name);

  // 优化建议存储（生产环境应使用数据库）
  private suggestions: Map<string, OptimizationSuggestion[]> = new Map();

  // 效果跟踪存储
  private effectTracking: Map<string, EffectTracking[]> = new Map();

  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private workflowStateService: WorkflowStateService,
  ) {}

  /**
   * 分析品牌并生成优化建议
   */
  async analyzeBrand(brandId: string): Promise<OptimizationAnalysis> {
    this.logger.log(`开始分析品牌: ${brandId}`);

    // 获取品牌信息
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
      select: ['id', 'name', 'industry'],
    });

    if (!brand) {
      throw new Error('品牌不存在');
    }

    // 获取监控数据（模拟）
    const monitorData = await this.getMonitorData(brandId);

    // 获取工作流状态
    const workflowState = await this.workflowStateService.getWorkflowState(brandId);

    // 生成建议
    const suggestions = this.generateSuggestions(brand, monitorData, workflowState);

    // 保存建议
    this.suggestions.set(brandId, suggestions);

    // 统计分析
    const summary = {
      total: suggestions.length,
      byPriority: {
        [OptimizationPriority.CRITICAL]: suggestions.filter(s => s.priority === OptimizationPriority.CRITICAL).length,
        [OptimizationPriority.HIGH]: suggestions.filter(s => s.priority === OptimizationPriority.HIGH).length,
        [OptimizationPriority.MEDIUM]: suggestions.filter(s => s.priority === OptimizationPriority.MEDIUM).length,
        [OptimizationPriority.LOW]: suggestions.filter(s => s.priority === OptimizationPriority.LOW).length,
      },
      byType: {
        [OptimizationType.KEYWORD]: suggestions.filter(s => s.type === OptimizationType.KEYWORD).length,
        [OptimizationType.CONTENT]: suggestions.filter(s => s.type === OptimizationType.CONTENT).length,
        [OptimizationType.TECHNICAL]: suggestions.filter(s => s.type === OptimizationType.TECHNICAL).length,
        [OptimizationType.COMPETITOR]: suggestions.filter(s => s.type === OptimizationType.COMPETITOR).length,
        [OptimizationType.LOCAL]: suggestions.filter(s => s.type === OptimizationType.LOCAL).length,
        [OptimizationType.LINK]: suggestions.filter(s => s.type === OptimizationType.LINK).length,
      },
    };

    return {
      brandId,
      suggestions,
      summary,
      autoExecutableCount: suggestions.filter(s => s.autoExecutable).length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取优化建议列表
   */
  async getSuggestions(brandId: string, filters?: {
    type?: OptimizationType;
    priority?: OptimizationPriority;
    status?: OptimizationStatus;
  }): Promise<OptimizationSuggestion[]> {
    let suggestions = this.suggestions.get(brandId) || [];

    if (filters?.type) {
      suggestions = suggestions.filter(s => s.type === filters.type);
    }
    if (filters?.priority) {
      suggestions = suggestions.filter(s => s.priority === filters.priority);
    }
    if (filters?.status) {
      suggestions = suggestions.filter(s => s.status === filters.status);
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = {
        [OptimizationPriority.CRITICAL]: 0,
        [OptimizationPriority.HIGH]: 1,
        [OptimizationPriority.MEDIUM]: 2,
        [OptimizationPriority.LOW]: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 更新建议状态
   */
  async updateSuggestionStatus(
    suggestionId: string,
    status: OptimizationStatus,
  ): Promise<OptimizationSuggestion | null> {
    for (const [brandId, suggestions] of this.suggestions.entries()) {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        suggestion.status = status;
        suggestion.updatedAt = new Date().toISOString();
        
        if (status === OptimizationStatus.COMPLETED) {
          suggestion.completedAt = new Date().toISOString();
          suggestion.executedBy = 'manual';
        }

        // 如果批准了建议，可能需要更新工作流状态
        if (status === OptimizationStatus.APPROVED && suggestion.autoExecutable) {
          await this.executeSuggestion(suggestion);
        }

        return suggestion;
      }
    }
    return null;
  }

  /**
   * 执行优化建议
   */
  async executeSuggestion(suggestion: OptimizationSuggestion): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    if (!suggestion.autoExecutable) {
      return { success: false, error: '该建议不支持自动执行' };
    }

    this.logger.log(`执行优化建议: ${suggestion.id}`);

    try {
      let result: any;

      switch (suggestion.type) {
        case OptimizationType.KEYWORD:
          result = await this.executeKeywordOptimization(suggestion);
          break;
        case OptimizationType.CONTENT:
          result = await this.executeContentOptimization(suggestion);
          break;
        case OptimizationType.LOCAL:
          result = await this.executeLocalOptimization(suggestion);
          break;
        default:
          return { success: false, error: '不支持的优化类型' };
      }

      // 更新建议状态
      suggestion.status = OptimizationStatus.COMPLETED;
      suggestion.completedAt = new Date().toISOString();
      suggestion.executedBy = 'auto';
      suggestion.executionResult = JSON.stringify(result);
      suggestion.updatedAt = new Date().toISOString();

      // 创建效果跟踪记录
      this.trackEffect(suggestion.id, suggestion.relatedMetrics || []);

      return { success: true, result };
    } catch (error) {
      this.logger.error(`执行优化建议失败: ${error.message}`);
      suggestion.status = OptimizationStatus.REJECTED;
      suggestion.executionResult = error.message;
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取效果跟踪
   */
  async getEffectTracking(suggestionId: string): Promise<EffectTracking[]> {
    return this.effectTracking.get(suggestionId) || [];
  }

  /**
   * 获取待处理的高优先级建议
   */
  async getPendingHighPrioritySuggestions(brandId: string): Promise<OptimizationSuggestion[]> {
    const suggestions = this.suggestions.get(brandId) || [];
    return suggestions
      .filter(s => 
        (s.priority === OptimizationPriority.CRITICAL || s.priority === OptimizationPriority.HIGH) &&
        s.status === OptimizationStatus.PENDING
      )
      .slice(0, 5);
  }

  // ==================== 私有方法 ====================

  /**
   * 获取监控数据（模拟实现）
   */
  private async getMonitorData(brandId: string): Promise<MonitorData> {
    // 实际应该从监控服务获取真实数据
    return {
      brandId,
      timestamp: new Date().toISOString(),
      keywords: [
        { keyword: '品牌名+城市', position: 15, change: -2, volume: 1000 },
        { keyword: '服务类型+附近', position: 8, change: 1, volume: 500 },
        { keyword: '品牌关键词', position: 3, change: 0, volume: 2000 },
      ],
      traffic: {
        organic: 5000,
        local: 2000,
        referral: 500,
        change: 5,
      },
      engagement: {
        impressions: 50000,
        clicks: 2500,
        ctr: 5,
        conversions: 50,
      },
      localRanking: {
        mapVisibility: 60,
        localPack: 8,
        change: -3,
      },
    };
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(
    brand: Brand,
    monitorData: MonitorData,
    workflowState: any,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 1. 关键词优化建议
    const decliningKeywords = monitorData.keywords.filter(k => k.change < 0);
    if (decliningKeywords.length > 0) {
      suggestions.push({
        id: `opt_${Date.now()}_1`,
        brandId: brand.id,
        type: OptimizationType.KEYWORD,
        priority: OptimizationPriority.HIGH,
        title: '关键词排名下降需要关注',
        description: `以下关键词排名下降: ${decliningKeywords.map(k => k.keyword).join(', ')}`,
        rationale: '排名下降可能导致流量减少',
        expectedImpact: '稳定或提升相关流量 10-20%',
        estimatedEffort: '1-2小时/关键词',
        status: OptimizationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExecutable: false,
        relatedKeywords: decliningKeywords.map(k => k.keyword),
      });
    }

    // 2. 本地排名优化建议
    if (monitorData.localRanking && monitorData.localRanking.change < 0) {
      suggestions.push({
        id: `opt_${Date.now()}_2`,
        brandId: brand.id,
        type: OptimizationType.LOCAL,
        priority: OptimizationPriority.CRITICAL,
        title: '本地搜索排名下降',
        description: 'Google My Business 或百度商家信息可能需要优化',
        rationale: `本地排名从 ${monitorData.localRanking.localPack + Math.abs(monitorData.localRanking.change)} 下降到 ${monitorData.localRanking.localPack}`,
        expectedImpact: '提升本地搜索曝光 30-50%',
        estimatedEffort: '2-3小时',
        status: OptimizationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExecutable: true,
        relatedMetrics: ['localRanking', 'mapVisibility'],
      });
    }

    // 3. 内容优化建议
    if (workflowState.strategy !== ModuleState.COMPLETED) {
      suggestions.push({
        id: `opt_${Date.now()}_3`,
        brandId: brand.id,
        type: OptimizationType.CONTENT,
        priority: OptimizationPriority.MEDIUM,
        title: '建议生成 GEO 优化策略',
        description: '当前品牌还未完成策略制定，建议先完成策略生成以获得更精准的优化方向',
        rationale: '基于品牌现状制定系统化的优化方案',
        expectedImpact: '提供明确的优化路径',
        estimatedEffort: '30分钟',
        status: OptimizationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExecutable: true,
        relatedMetrics: ['strategyScore'],
      });
    }

    // 4. CTR 优化建议
    if (monitorData.engagement.ctr < 3) {
      suggestions.push({
        id: `opt_${Date.now()}_4`,
        brandId: brand.id,
        type: OptimizationType.CONTENT,
        priority: OptimizationPriority.HIGH,
        title: '点击率偏低需要优化',
        description: '当前 CTR 为 5%，低于行业平均 7-10%',
        rationale: '低 CTR 意味着虽然有曝光但用户不点击',
        expectedImpact: '提升 CTR 到 7% 以上',
        estimatedEffort: '1-2小时',
        status: OptimizationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExecutable: false,
        relatedMetrics: ['ctr', 'clicks'],
      });
    }

    // 5. 竞品分析建议
    suggestions.push({
      id: `opt_${Date.now()}_5`,
      brandId: brand.id,
      type: OptimizationType.COMPETITOR,
      priority: OptimizationPriority.LOW,
      title: '定期竞品分析',
      description: '建议每周进行一次竞品分析，了解竞争对手的优化策略',
      rationale: '知己知彼，持续优化',
      expectedImpact: '发现新的优化机会',
      estimatedEffort: '每周30分钟',
      status: OptimizationStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoExecutable: false,
    });

    return suggestions;
  }

  /**
   * 执行关键词优化
   */
  private async executeKeywordOptimization(suggestion: OptimizationSuggestion): Promise<any> {
    this.logger.log('执行关键词优化');
    // 实际应该调用相关服务更新关键词策略
    return { updatedKeywords: suggestion.relatedKeywords };
  }

  /**
   * 执行内容优化
   */
  private async executeContentOptimization(suggestion: OptimizationSuggestion): Promise<any> {
    this.logger.log('执行内容优化');
    // 实际应该调用内容生成服务
    return { message: '内容优化建议已生成' };
  }

  /**
   * 执行本地优化
   */
  private async executeLocalOptimization(suggestion: OptimizationSuggestion): Promise<any> {
    this.logger.log('执行本地优化');
    // 实际应该更新商家信息
    return { message: '本地优化任务已创建' };
  }

  /**
   * 跟踪效果
   */
  private trackEffect(suggestionId: string, metrics: string[]): void {
    const tracking: EffectTracking[] = metrics.map(metric => ({
      suggestionId,
      baseline: { metric, value: Math.random() * 100 },
      current: { metric, value: Math.random() * 100 },
      change: 0,
      changePercent: 0,
      trend: 'stable',
      updatedAt: new Date().toISOString(),
    }));

    this.effectTracking.set(suggestionId, tracking);
  }
}
