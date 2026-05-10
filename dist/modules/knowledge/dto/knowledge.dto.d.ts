export declare class GetKnowledgeBaseDto {
    id: string;
    organizationId: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    basicInfo?: any;
    bizPositioning?: any;
    productService?: any;
    competitorMarket?: any;
    geoGoals?: any;
    fileIndex?: any;
    supplement?: any;
    lastDiagnosisRefresh?: Date;
}
export declare class UpdateKnowledgeBaseDto {
    basicInfo?: any;
    bizPositioning?: any;
    productService?: any;
    competitorMarket?: any;
    geoGoals?: any;
    supplement?: any;
}
export declare class CreateKnowledgeBaseDto {
    organizationId?: string;
    basicInfo?: any;
    bizPositioning?: any;
    productService?: any;
    geoGoals?: any;
}
export declare class FileUploadResponseDto {
    fileId: string;
    url: string;
    status: 'uploaded' | 'processing' | 'error';
    fileName: string;
    fileSize: number;
}
export declare class KnowledgeVersionDto {
    version: number;
    updatedAt: Date;
    changedFields: string[];
    versionRemark?: string;
}
export declare class AiSuggestDto {
    field: string;
    sourceUrl?: string;
    sourceText?: string;
}
export declare class AiSuggestResponseDto {
    suggestion: string;
    confidence: number;
    matchedFields: string[];
}
export declare class EnhancedFieldSuggestionDto {
    field: string;
    context?: string;
}
export declare class EnhancedSuggestionResponseDto {
    suggestion: string;
    confidence: number;
    tips: string[];
    examples: string[];
}
export declare class ExtractFromUrlDto {
    url: string;
    targetField: string;
}
export declare class ExtractFromUrlResponseDto {
    extracted: string;
    confidence: number;
    source: string;
    suggestion: string;
}
export declare class ExtractFromTextDto {
    text: string;
    targetFields: string[];
}
export declare class ExtractFromTextResponseDto {
    results: Record<string, {
        extracted: string;
        confidence: number;
    }>;
    summary: string;
}
export declare class CompletenessReportDto {
    overall: number;
    critical: number;
    sections: {
        name: string;
        score: number;
        status: 'good' | 'warning' | 'critical';
        suggestions: string[];
    }[];
    recommendations: string[];
}
export declare class KeywordSuggestionDto {
    primary: string[];
    secondary: string[];
    longTail: string[];
    competition: 'high' | 'medium' | 'low';
}
export declare class IncrementalDiagnosisTriggerDto {
    changedFields?: string[];
}
export declare class IncrementalDiagnosisResponseDto {
    shouldTrigger: boolean;
    reason: string;
    taskId?: string;
}
export declare class ManualTriggerDiagnosisDto {
    dimensions?: string[];
}
export declare class DiagnosisSuggestionDto {
    shouldSuggest: boolean;
    reason?: string;
    lastDiagnosisAge?: number;
}
export declare class SemanticSearchDto {
    query: string;
    topK?: number;
}
export declare class SemanticSearchResponseDto {
    results: {
        section: string;
        similarity: number;
        text: string;
    }[];
}
export declare class VectorIndexStatusDto {
    indexed: boolean;
    sections: string[];
    updatedAt?: Date;
}
export declare class SimilarKnowledgeBaseDto {
    organizationId: string;
    similarity: number;
}
