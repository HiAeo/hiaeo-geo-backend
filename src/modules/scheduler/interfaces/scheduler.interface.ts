/**
 * 定时任务接口定义
 */

/** 任务类型 */
export enum TaskType {
  DIAGNOSIS = 'diagnosis',           // 品牌诊断
  MONITOR_COLLECT = 'monitor_collect', // 监控数据采集
  NOTIFICATION = 'notification',     // 通知推送
  DATA_SYNC = 'data_sync',           // 数据同步
  HEALTH_CHECK = 'health_check',     // 健康检查
  CONTENT_PUBLISH = 'content_publish', // 内容发布
  REPORT_GENERATE = 'report_generate', // 报告生成
}

/** 任务状态 */
export enum TaskStatus {
  PENDING = 'pending',       // 等待执行
  RUNNING = 'running',       // 执行中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed',         // 失败
  CANCELLED = 'cancelled',   // 已取消
}

/** 任务执行结果 */
export interface TaskResult {
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  executedAt: string;
}

/** 定时任务配置 */
export interface ScheduledTaskConfig {
  id: string;
  name: string;
  type: TaskType;
  cronExpression: string;
  enabled: boolean;
  options?: {
    brandIds?: string[];      // 指定品牌，为空则所有品牌
    concurrency?: number;     // 并发数
    retryCount?: number;      // 重试次数
    retryDelay?: number;      // 重试延迟(ms)
    timeout?: number;        // 超时时间(ms)
  };
}

/** 任务执行记录 */
export interface TaskExecutionRecord {
  id: string;
  taskId: string;
  taskName: string;
  taskType: TaskType;
  status: TaskStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  result?: TaskResult;
  brandId?: string;
  error?: string;
}

/** 任务统计 */
export interface TaskStatistics {
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
  lastExecution?: TaskExecutionRecord;
  nextExecution?: string;
}
