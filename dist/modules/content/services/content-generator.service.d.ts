import { AiService } from '../../ai/services/ai.service';
import { GenerateSeoArticleDto, GenerateFaqDto, GenerateJsonLdDto, GenerateProductDescriptionDto } from '../dto/content-generation.dto';
export interface GeneratedContent {
    title: string;
    body: string;
    type: string;
    metaDescription?: string;
    keywords?: string[];
    suggestions?: string[];
}
export interface SeoArticleResult {
    title: string;
    content: string;
    metaDescription: string;
    keywords: string[];
    headings: {
        level: number;
        text: string;
    }[];
    wordCount: number;
    readingTime: number;
}
export interface FaqResult {
    name: string;
    faqs: {
        question: string;
        answer: string;
    }[];
    jsonLd: string;
}
export interface JsonLdResult {
    schemaType: string;
    schema: Record<string, any>;
    script: string;
}
export interface ProductDescriptionResult {
    productName: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
    useCases: string[];
    specifications: {
        name: string;
        value: string;
    }[];
}
export declare class ContentGeneratorService {
    private aiService;
    constructor(aiService: AiService);
    generateSeoArticle(dto: GenerateSeoArticleDto): Promise<SeoArticleResult>;
    generateFaq(dto: GenerateFaqDto): Promise<FaqResult>;
    generateJsonLd(dto: GenerateJsonLdDto): Promise<JsonLdResult>;
    generateProductDescription(dto: GenerateProductDescriptionDto): Promise<ProductDescriptionResult>;
    checkSensitiveWords(content: string): Promise<{
        hasSensitive: boolean;
        words: string[];
    }>;
    optimizeContent(content: string, type?: string): Promise<string>;
    private buildSeoArticlePrompt;
    private buildFaqPrompt;
    private buildProductDescriptionPrompt;
    private buildJsonLdSchema;
    private parseSeoArticleResult;
    private parseFaqResult;
    private generateFaqJsonLd;
    private parseProductDescriptionResult;
    private getSampleSeoArticle;
    private getSampleFaq;
    private getSampleProductDescription;
}
