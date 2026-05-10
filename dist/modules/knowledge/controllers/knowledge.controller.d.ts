import { KnowledgeService } from '../services/knowledge.service';
import { EnhancedAiSuggestionService } from '../services/enhanced-ai-suggestion.service';
import { IncrementalDiagnosisTriggerService } from '../services/incremental-diagnosis-trigger.service';
import { VectorStorageService } from '../services/vector-storage.service';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto, AiSuggestDto, EnhancedFieldSuggestionDto, ExtractFromUrlDto, ExtractFromTextDto, ManualTriggerDiagnosisDto, SemanticSearchDto } from '../dto/knowledge.dto';
export declare class KnowledgeController {
    private readonly knowledgeService;
    private readonly aiSuggestionService;
    private readonly diagnosisTriggerService;
    private readonly vectorStorageService;
    constructor(knowledgeService: KnowledgeService, aiSuggestionService: EnhancedAiSuggestionService, diagnosisTriggerService: IncrementalDiagnosisTriggerService, vectorStorageService: VectorStorageService);
    getProfile(req: any): Promise<{
        data: import("../dto/knowledge.dto").GetKnowledgeBaseDto | null;
    }>;
    createProfile(req: any, dto: CreateKnowledgeBaseDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../dto/knowledge.dto").GetKnowledgeBaseDto;
        message?: undefined;
    }>;
    updateProfile(req: any, dto: UpdateKnowledgeBaseDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            version: number;
            updatedAt: Date;
        };
        message?: undefined;
    }>;
    uploadFile(req: any, file: any, module: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../dto/knowledge.dto").FileUploadResponseDto;
        message?: undefined;
    }>;
    deleteFile(req: any, fileId: string): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    getHistory(req: any, page?: string, size?: string): Promise<{
        data: {
            list: import("../dto/knowledge.dto").KnowledgeVersionDto[];
            total: number;
        };
    }>;
    getAiSuggestion(dto: AiSuggestDto): Promise<{
        data: import("../dto/knowledge.dto").AiSuggestResponseDto;
    }>;
    getEnhancedFieldSuggestion(req: any, dto: EnhancedFieldSuggestionDto): Promise<{
        data: {
            suggestion: string;
            confidence: number;
            tips: string[];
            examples: string[];
        };
    }>;
    extractFromUrl(req: any, dto: ExtractFromUrlDto): Promise<{
        data: {
            extracted: string;
            confidence: number;
            source: string;
            suggestion: string;
        };
    }>;
    extractFromText(req: any, dto: ExtractFromTextDto): Promise<{
        data: {
            results: Record<string, {
                extracted: string;
                confidence: number;
            }>;
            summary: string;
        };
    }>;
    getCompletenessReport(req: any): Promise<{
        data: {
            overall: number;
            critical: number;
            sections: {
                name: string;
                score: number;
                status: "good" | "warning" | "critical";
                suggestions: string[];
            }[];
            recommendations: string[];
        };
    }>;
    getKeywordSuggestions(req: any): Promise<{
        data: {
            primary: string[];
            secondary: string[];
            longTail: string[];
            competition: "high" | "medium" | "low";
        };
    }>;
    getDiagnosisSuggestion(req: any): Promise<{
        data: {
            shouldSuggest: boolean;
            reason?: string;
            lastDiagnosisAge?: number;
        };
    }>;
    triggerIncrementalDiagnosis(req: any, dto: ManualTriggerDiagnosisDto): Promise<{
        success: boolean;
        taskId: string;
    }>;
    semanticSearch(req: any, dto: SemanticSearchDto): Promise<{
        data: {
            results: {
                section: string;
                similarity: number;
                text: string;
            }[];
        };
    }>;
    rebuildIndex(req: any): Promise<{
        status: "created" | "updated";
        sections: string[];
        success: boolean;
    }>;
    getIndexStatus(req: any): Promise<{
        data: {
            indexed: boolean;
            sections: string[];
            updatedAt?: Date;
        };
    }>;
    findSimilarKnowledgeBases(req: any, topK?: string): Promise<{
        data: {
            similar: {
                organizationId: string;
                similarity: number;
            }[];
        };
    }>;
}
