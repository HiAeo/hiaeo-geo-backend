import { Repository } from 'typeorm';
import { WorkflowDefinition } from '../entities/workflow-definition.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto';
export declare class WorkflowService {
    private readonly workflowRepo;
    private readonly logger;
    constructor(workflowRepo: Repository<WorkflowDefinition>);
    create(organizationId: string, dto: CreateWorkflowDto): Promise<WorkflowDefinition>;
    update(id: string, dto: UpdateWorkflowDto): Promise<WorkflowDefinition>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<WorkflowDefinition>;
    findByOrganization(organizationId: string, options?: {
        triggerType?: string;
        isEnabled?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: WorkflowDefinition[];
        total: number;
    }>;
    toggleEnabled(id: string, isEnabled: boolean): Promise<WorkflowDefinition>;
}
