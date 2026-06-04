import { Injectable, Logger } from '@nestjs/common';
import { OptimizationExecutionRepository } from '../repositories/optimization-execution.repository';
import { OptimizationSuggestionRepository } from '../repositories/optimization-suggestion.repository';

/**
 * 效果跟踪服务
 * 追踪优化执行效果，计算评分并提供改进建议
 */
@Injectable()
export class EffectTrackingService {
  private readonly logger = new Logger(EffectTrackingService.name);

  constructor(
    private readonly executionRepository: OptimizationExecutionRepository,
    private readonly suggestionRepository: OptimizationSuggestionRepository,
  ) {}

  /**
   * 获取执行详情
   */
  async getExecutionDetails(executionId: string) {
    const execution = await this.executionRepository.findById(executionId);
    
    if (!execution) {
      return null;
    }

    return {
      execution,
      effectScore: this.calculateEffectScore(execution),
      metrics: execution.metrics,
    };
  }

  /**
   * 获取效果指标
   */
  async getEffectMetrics(executionId: string) {
    const execution = await this.executionRepository.findById(executionId);
    
    if (!execution) {
      return null;
    }

    return {
      traffic: execution.metrics?.traffic || 0,
      ranking: execution.metrics?.ranking || 0,
      coverage: execution.metrics?.coverage || 0,
      authority: execution.metrics?.authority || 0,
      suppression: execution.metrics?.suppression || 0,
      overallScore: this.calculateEffectScore(execution),
    };
  }

  /**
   * 上报效果指标
   */
  async trackMetric(executionId: string, metricData: {
    traffic?: number;
    ranking?: number;
    coverage?: number;
    authority?: number;
    suppression?: number;
    note?: string;
  }) {
    const execution = await this.executionRepository.findById(executionId);
    
    if (!execution) {
      throw new Error('执行记录不存在');
    }

    const metrics = execution.metrics || {};
    
    if (metricData.traffic !== undefined) metrics.traffic = metricData.traffic;
    if (metricData.ranking !== undefined) metrics.ranking = metricData.ranking;
    if (metricData.coverage !== undefined) metrics.coverage = metricData.coverage;
    if (metricData.authority !== undefined) metrics.authority = metricData.authority;
    if (metricData.suppression !== undefined) metrics.suppression = metricData.suppression;

    execution.metrics = metrics;
    execution.notes = metricData.note || execution.notes;
    
    await this.executionRepository.save(execution);
    
    return {
      success: true,
      updatedMetrics: metrics,
      effectScore: this.calculateEffectScore(execution),
    };
  }

  /**
   * 获取执行历史
   */
  async getExecutionHistory(brandId: string, page: number = 1, size: number = 10) {
    const executions = await this.executionRepository.findByBrandId(brandId, page, size);
    const total = await this.executionRepository.countByBrandId(brandId);

    const executionsWithScores = executions.map(exec => ({
      ...exec,
      effectScore: this.calculateEffectScore(exec),
    }));

    return {
      list: executionsWithScores,
      total,
      page,
      size,
    };
  }

  /**
   * 生成效果分析报告
   */
  async generateEffectAnalysis(brandId: string) {
    const executions = await this.executionRepository.findByBrandId(brandId, 1, 30);
    
    if (executions.length === 0) {
      return {
        summary: '暂无执行数据',
        suggestions: ['开始执行优化建议以收集效果数据'],
        trend: null,
      };
    }

    // 计算各维度平均分
    const avgScores = {
      traffic: 0,
      ranking: 0,
      coverage: 0,
      authority: 0,
      suppression: 0,
    };

    let validCount = 0;
    for (const exec of executions) {
      if (exec.metrics) {
        avgScores.traffic += exec.metrics.traffic || 0;
        avgScores.ranking += exec.metrics.ranking || 0;
        avgScores.coverage += exec.metrics.coverage || 0;
        avgScores.authority += exec.metrics.authority || 0;
        avgScores.suppression += exec.metrics.suppression || 0;
        validCount++;
      }
    }

    if (validCount > 0) {
      avgScores.traffic = Math.round(avgScores.traffic / validCount);
      avgScores.ranking = Math.round(avgScores.ranking / validCount);
      avgScores.coverage = Math.round(avgScores.coverage / validCount);
      avgScores.authority = Math.round(avgScores.authority / validCount);
      avgScores.suppression = Math.round(avgScores.suppression / validCount);
    }

    // 生成改进建议
    const suggestions = this.generateImprovementSuggestions(avgScores);

    // 计算趋势
    const trend = this.calculateTrend(executions);

    return {
      summary: `最近${executions.length}次执行的平均效果评分`,
      averageScores: avgScores,
      overallScore: Math.round(
        (avgScores.traffic + avgScores.ranking + avgScores.coverage + avgScores.authority + avgScores.suppression) / 5
      ),
      executionCount: executions.length,
      successRate: Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100),
      trend,
      suggestions,
    };
  }

  /**
   * 计算效果评分
   */
  private calculateEffectScore(execution: any): number {
    const metrics = execution.metrics || {};
    
    const weights = {
      traffic: 0.25,
      ranking: 0.25,
      coverage: 0.2,
      authority: 0.15,
      suppression: 0.15,
    };

    const score = 
      (metrics.traffic || 0) * weights.traffic +
      (metrics.ranking || 0) * weights.ranking +
      (metrics.coverage || 0) * weights.coverage +
      (metrics.authority || 0) * weights.authority +
      (metrics.suppression || 0) * weights.suppression;

    return Math.round(score);
  }

  /**
   * 生成改进建议
   */
  private generateImprovementSuggestions(scores: any): string[] {
    const suggestions: string[] = [];

    if (scores.traffic < 70) {
      suggestions.push('建议增加内容发布频率，提高品牌曝光');
    }
    if (scores.ranking < 70) {
      suggestions.push('建议优化关键词布局，提升搜索排名');
    }
    if (scores.coverage < 70) {
      suggestions.push('建议拓展内容类型，覆盖更多搜索场景');
    }
    if (scores.authority < 70) {
      suggestions.push('建议加强外链建设，提升品牌权威性');
    }
    if (scores.suppression < 70) {
      suggestions.push('建议加强竞品压制策略，抢占市场份额');
    }

    if (suggestions.length === 0) {
      suggestions.push('各项指标表现良好，继续保持');
    }

    return suggestions;
  }

  /**
   * 计算趋势
   */
  private calculateTrend(executions: any[]): 'up' | 'down' | 'stable' {
    if (executions.length < 2) return 'stable';

    const recentExecutions = executions.slice(0, 5);
    const olderExecutions = executions.slice(5, 10);

    if (olderExecutions.length === 0) return 'stable';

    const recentAvg = this.calculateAverageScore(recentExecutions);
    const olderAvg = this.calculateAverageScore(olderExecutions);

    const diff = recentAvg - olderAvg;

    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  }

  private calculateAverageScore(executions: any[]): number {
    if (executions.length === 0) return 0;

    const total = executions.reduce((sum, exec) => {
      return sum + this.calculateEffectScore(exec);
    }, 0);

    return total / executions.length;
  }
}
