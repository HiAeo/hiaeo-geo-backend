import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { AiService } from '../../ai/services/ai.service';
import { EmbeddingService } from './embedding.service';
export declare class EnhancedAiSuggestionService {
    private knowledgeRepository;
    private aiService;
    private embeddingService;
    private readonly logger;
    private readonly FIELD_PROMPTS;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>, aiService: AiService, embeddingService: EmbeddingService);
    getFieldSuggestion(organizationId: string, field: string): Promise<{
        suggestion: string;
        confidence: number;
        tips: string[];
        examples: string[];
    }>;
    extractFromUrl(organizationId: string, url: string, targetField: string): Promise<{
        extracted: string;
        confidence: number;
        source: string;
        suggestion: string;
    }>;
    private getCurrentFieldValuesFromKnowledge;
    extractFromText(organizationId: string, text: string, targetFields: string[]): Promise<{
        results: Record<string, {
            extracted: string;
            confidence: number;
        }>;
        summary: string;
    }>;
    generateCompletenessReport(organizationId: string): Promise<{
        overall: number;
        critical: number;
        sections: {
            name: string;
            score: number;
            status: 'good' | 'warning' | 'critical';
            suggestions: string[];
        }[];
        recommendations: string[];
    }>;
    suggestKeywords(organizationId: string): Promise<{
        primary: string[];
        secondary: string[];
        longTail: string[];
        competition: 'high' | 'medium' | 'low';
    }>;
    private buildContextPrompt;
    private getFieldValue;
    private getRelatedFields;
    private parseAiResponse;
    private parseJsonResponse;
    private getFallbackSuggestion;
    private analyzeSections;
    private calculateSectionScore;
    private generateRecommendations;
    private buildKeywordContext;
    private getFallbackKeywords;
    private getCurrentFieldValues;
}
