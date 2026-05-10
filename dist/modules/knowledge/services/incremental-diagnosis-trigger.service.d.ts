import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { DiagnosisTaskService } from '../../diagnosis/services/diagnosis-task.service';
import { EmbeddingService } from './embedding.service';
export declare class IncrementalDiagnosisTriggerService {
    private knowledgeRepository;
    private diagnosisTaskService;
    private embeddingService;
    private readonly logger;
    private readonly SIGNIFICANCE_THRESHOLD;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>, diagnosisTaskService: DiagnosisTaskService, embeddingService: EmbeddingService);
    checkAndTrigger(organizationId: string, changedFields: string[], oldData: any, newData: any, userId: string): Promise<{
        shouldTrigger: boolean;
        reason: string;
        taskId?: string;
    }>;
    manualTrigger(organizationId: string, userId: string, dimensions?: string[]): Promise<string>;
    private calculateChangeSignificance;
    private calculateFieldChange;
    private levenshteinDistance;
    private getTriggerReasons;
    private createIncrementalDiagnosisTask;
    private mapFieldsToDimensions;
    shouldSuggestDiagnosis(organizationId: string): Promise<{
        shouldSuggest: boolean;
        reason?: string;
        lastDiagnosisAge?: number;
    }>;
    private calculateCompleteness;
    private isFieldFilled;
}
