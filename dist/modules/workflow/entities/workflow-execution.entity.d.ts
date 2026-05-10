import { WorkflowDefinition } from './workflow-definition.entity';
export declare enum WorkflowExecutionStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare class WorkflowExecution {
    id: string;
    organizationId: string;
    workflowId: string;
    workflow: WorkflowDefinition;
    status: WorkflowExecutionStatus;
    triggerType: string;
    triggeredBy: string;
    context: Record<string, any>;
    result: Record<string, any>;
    error: string | null;
    actionResults: WorkflowActionResult[];
    duration: number;
    startedAt: Date;
    completedAt: Date;
    createdAt: Date;
}
export interface WorkflowActionResult {
    actionIndex: number;
    actionType: string;
    success: boolean;
    result?: any;
    error?: string;
    duration: number;
}
