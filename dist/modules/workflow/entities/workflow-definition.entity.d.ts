export declare enum WorkflowTriggerType {
    KNOWLEDGE_UPDATED = "KNOWLEDGE_UPDATED",
    DIAGNOSIS_COMPLETED = "DIAGNOSIS_COMPLETED",
    INDEX_REBUILT = "INDEX_REBUILT",
    SCHEDULED = "SCHEDULED"
}
export declare class WorkflowDefinition {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    triggerType: WorkflowTriggerType;
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
    isEnabled: boolean;
    executionCount: number;
    lastExecutedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn';
    value: any;
}
export interface WorkflowAction {
    type: 'sendNotification' | 'rebuildIndex' | 'triggerDiagnosis' | 'updateKnowledge' | 'callWebhook';
    params: Record<string, any>;
    continueOnError?: boolean;
}
