import { WorkflowService } from '../services/workflow.service';
import { WorkflowEngine } from '../services/workflow-engine.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto';
import { WorkflowExecutionStatus } from '../entities';
export declare class WorkflowController {
    private readonly workflowService;
    private readonly workflowEngine;
    constructor(workflowService: WorkflowService, workflowEngine: WorkflowEngine);
    create(dto: CreateWorkflowDto, organizationId: string): Promise<import("../entities").WorkflowDefinition>;
    findAll(organizationId: string, triggerType?: string, isEnabled?: string, limit?: string, offset?: string): Promise<{
        items: import("../entities").WorkflowDefinition[];
        total: number;
    }>;
    findById(id: string): Promise<import("../entities").WorkflowDefinition>;
    update(id: string, dto: UpdateWorkflowDto): Promise<import("../entities").WorkflowDefinition>;
    delete(id: string): Promise<void>;
    execute(id: string, organizationId: string, context?: Record<string, any>): Promise<import("../services/workflow-engine.service").ExecutionResult>;
    getExecutionHistory(organizationId: string, workflowId?: string, status?: WorkflowExecutionStatus, limit?: string, offset?: string): Promise<{
        items: import("../entities").WorkflowExecution[];
        total: number;
    }>;
}
