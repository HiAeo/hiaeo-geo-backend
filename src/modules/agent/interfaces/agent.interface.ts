/**
 * Agent 接口定义
 */

/** 工作流状态 */
export enum WorkflowStage {
  IDLE = 'idle',
  DIAGNOSIS = 'diagnosis',
  STRATEGY = 'strategy',
  EXECUTION = 'execution',
  MONITORING = 'monitoring',
  COMPLETED = 'completed',
}

/** 工作流状态详情 */
export interface WorkflowState {
  stage: WorkflowStage;
  diagnosis?: {
    taskId?: string;
    progress: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    reportId?: string;
  };
  strategy?: {
    strategyId?: string;
    progress: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
  };
  execution?: {
    contentIds: string[];
    progress: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
  };
  startedAt?: string;
  updatedAt?: string;
  error?: string;
}

/** Agent 执行结果 */
export interface AgentExecutionResult {
  success: boolean;
  workflowId: string;
  brandId: string;
  stages: {
    diagnosis?: {
      success: boolean;
      taskId?: string;
      reportId?: string;
      error?: string;
    };
    strategy?: {
      success: boolean;
      strategyId?: string;
      error?: string;
    };
    execution?: {
      success: boolean;
      contentIds: string[];
      error?: string;
    };
  };
  totalDuration: number;
  error?: string;
}

/** Agent 对话消息 */
export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    workflowStage?: WorkflowStage;
    attachments?: string[];
  };
}

/** Agent 对话会话 */
export interface AgentSession {
  id: string;
  brandId: string;
  messages: AgentMessage[];
  workflowState: WorkflowState;
  createdAt: string;
  updatedAt: string;
}

/** 一键串联请求 */
export interface ChainRequest {
  brandId: string;
  startFrom?: WorkflowStage;
  options?: {
    skipDiagnosis?: boolean;
    skipStrategy?: boolean;
    skipExecution?: boolean;
    customReportId?: string;
    customStrategyId?: string;
  };
}

/** Agent 健康检查 */
export interface AgentHealthStatus {
  healthy: boolean;
  services: {
    diagnosis: boolean;
    strategy: boolean;
    execution: boolean;
    vectorDb: boolean;
  };
  activeWorkflows: number;
  uptime: number;
}
