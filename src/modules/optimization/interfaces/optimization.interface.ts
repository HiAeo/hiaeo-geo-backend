/**
 * 优化建议接口定义
 */

/** 优化类型 */
export enum OptimizationType {
  KEYWORD = 'keyword',           // 关键词优化
  CONTENT = 'content',          // 内容优化
  TECHNICAL = 'technical',      // 技术优化
  COMPETITOR = 'competitor',    // 竞品分析
  LOCAL = 'local',              // 本地 SEO
  LINK = 'link',               // 链接优化
}

/** 优化优先级 */
export enum OptimizationPriority {
  CRITICAL = 'critical',        // 紧急
  HIGH = 'high',                // 高
  MEDIUM = 'medium',            // 中
  LOW = 'low',                  // 低
}

/** 优化状态 */
export enum OptimizationStatus {
  PENDING = 'pending',          // 待处理
  APPROVED = 'approved',        // 已批准
  IN_PROGRESS = 'in_progress', // 执行中
  COMPLETED = 'completed',      // 已完成
  REJECTED = 'rejected',        // 已拒绝
  DISMISSED = 'dismissed',      // 已忽略
}

/** 优化建议 */
export interface OptimizationSuggestion {
  id: string;
  brandId: string;
  type: OptimizationType;
  priority: OptimizationPriority;
  title: string;
  description: string;
  rationale: string;             // 依据
  expectedImpact: string;        // 预期效果
  estimatedEffort: string;      // 预估工作量
  status: OptimizationStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // 执行信息
  autoExecutable: boolean;
  executedBy?: 'auto' | 'manual';
  executionResult?: string;
  
  // 关联数据
  relatedMetrics?: string[];
  relatedKeywords?: string[];
  relatedContentId?: string;
}

/** 监控数据 */
export interface MonitorData {
  brandId: string;
  timestamp: string;
  keywords: {
    keyword: string;
    position: number;
    change: number;
    volume: number;
  }[];
  traffic: {
    organic: number;
    local: number;
    referral: number;
    change: number;
  };
  engagement: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
  };
  localRanking?: {
    mapVisibility: number;
    localPack: number;
    change: number;
  };
}

/** 效果跟踪 */
export interface EffectTracking {
  suggestionId: string;
  baseline: {
    metric: string;
    value: number;
  };
  current: {
    metric: string;
    value: number;
  };
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  updatedAt: string;
}

/** 优化分析结果 */
export interface OptimizationAnalysis {
  brandId: string;
  suggestions: OptimizationSuggestion[];
  summary: {
    total: number;
    byPriority: Record<OptimizationPriority, number>;
    byType: Record<OptimizationType, number>;
  };
  autoExecutableCount: number;
  timestamp: string;
}
