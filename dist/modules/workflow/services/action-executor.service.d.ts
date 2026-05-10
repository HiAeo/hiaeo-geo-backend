import { Repository } from 'typeorm';
import { WorkflowDefinition, WorkflowAction } from '../entities/workflow-definition.entity';
export declare class ActionExecutorService {
    private readonly workflowRepo;
    private readonly logger;
    constructor(workflowRepo: Repository<WorkflowDefinition>);
    executeAction(action: WorkflowAction, context: Record<string, any>): Promise<{
        success: boolean;
        result?: any;
        error?: string;
    }>;
    private sendNotification;
    private rebuildIndex;
    private triggerDiagnosis;
    private updateKnowledge;
    private callWebhook;
    private interpolateTemplate;
}
