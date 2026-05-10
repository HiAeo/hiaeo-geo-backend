import { WorkflowTriggerType } from '../entities/workflow-definition.entity';
export declare class WorkflowConditionDto {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn';
    value: any;
}
export declare class WorkflowActionDto {
    type: 'sendNotification' | 'rebuildIndex' | 'triggerDiagnosis' | 'updateKnowledge' | 'callWebhook';
    params: Record<string, any>;
    continueOnError?: boolean;
}
export declare class CreateWorkflowDto {
    name: string;
    description?: string;
    triggerType: WorkflowTriggerType;
    conditions?: WorkflowConditionDto[];
    actions: WorkflowActionDto[];
    isEnabled?: boolean;
}
