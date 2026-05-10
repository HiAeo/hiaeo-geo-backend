import { WorkflowEngine } from './workflow-engine.service';
export declare class TriggerService {
    private readonly workflowEngine;
    private readonly logger;
    constructor(workflowEngine: WorkflowEngine);
    onKnowledgeUpdated(organizationId: string, knowledgeId: string, metadata?: Record<string, any>): Promise<void>;
    onDiagnosisCompleted(organizationId: string, knowledgeId: string, score: number, reportId?: string): Promise<void>;
    onIndexRebuilt(organizationId: string, knowledgeId: string, indexType?: string): Promise<void>;
    onScheduled(organizationId: string, cronExpression: string, metadata?: Record<string, any>): Promise<void>;
    onManual(workflowId: string, organizationId: string, context?: Record<string, any>): Promise<void>;
}
