import { Repository } from 'typeorm';
import { WorkflowDefinition, WorkflowTriggerType } from '../entities/workflow-definition.entity';
import { WorkflowExecution, WorkflowExecutionStatus, WorkflowActionResult } from '../entities/workflow-execution.entity';
import { ActionExecutorService } from './action-executor.service';
export interface ExecutionContext {
    organizationId: string;
    knowledgeId?: string;
    score?: number;
    reportId?: string;
    indexType?: string;
    cronExpression?: string;
    triggeredBy?: string;
    [key: string]: any;
}
export interface ExecutionResult {
    success: boolean;
    executionId: string;
    actionResults: WorkflowActionResult[];
    error?: string;
    duration: number;
}
export declare class WorkflowEngine {
    private readonly workflowRepo;
    private readonly executionRepo;
    private readonly actionExecutor;
    private readonly logger;
    constructor(workflowRepo: Repository<WorkflowDefinition>, executionRepo: Repository<WorkflowExecution>, actionExecutor: ActionExecutorService);
    evaluateConditions(workflow: WorkflowDefinition, context: ExecutionContext): boolean;
    private getContextValue;
    private evaluateCondition;
    execute(workflowId: string, context: ExecutionContext): Promise<ExecutionResult>;
    handleTrigger(triggerType: WorkflowTriggerType, context: ExecutionContext): Promise<void>;
    chainExecute(workflowId: string, context: ExecutionContext, chainWorkflowId?: string): Promise<ExecutionResult>;
    getExecutionHistory(organizationId: string, options?: {
        workflowId?: string;
        status?: WorkflowExecutionStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: WorkflowExecution[];
        total: number;
    }>;
}
