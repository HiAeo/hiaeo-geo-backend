import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { DiagnosisTaskService } from '../../diagnosis/services/diagnosis-task.service';
import { DiagnosisReport } from '../../diagnosis/entities/diagnosis-report.entity';
export declare class KnowledgeDiagnosisIntegrationService {
    private knowledgeRepository;
    private diagnosisTaskService;
    private reportRepository;
    private readonly logger;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>, diagnosisTaskService: DiagnosisTaskService, reportRepository: Repository<DiagnosisReport>);
    updateKnowledgeFromDiagnosis(organizationId: string, reportId: string): Promise<{
        updated: boolean;
        insights: string[];
    }>;
    private extractInsightsFromReport;
    getKnowledgeSummaryForDiagnosis(organizationId: string): Promise<{
        version: number;
        lastUpdate: string;
        completenessScore: number;
        keyFields: {
            name: string;
            status: string;
        }[];
        forbiddenWords?: string[];
    } | null>;
    shouldAutoTriggerDiagnosis(organizationId: string, changedFields: string[]): Promise<{
        shouldTrigger: boolean;
        reason: string;
        confidence: number;
    }>;
    private calculateChangeSignificance;
    private isFieldComplete;
    private calculateCompleteness;
}
