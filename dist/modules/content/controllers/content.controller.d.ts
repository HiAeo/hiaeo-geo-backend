import { ContentService } from '../services/content.service';
import { ContentAuditService } from '../services/content-audit.service';
import { ContentGeneratorService, SeoArticleResult, FaqResult, JsonLdResult, ProductDescriptionResult } from '../services/content-generator.service';
import { KnowledgeAwareContentService } from '../services/knowledge-aware-content.service';
import { CreateContentDto, QueryContentDto, GenerateSeoArticleDto, GenerateFaqDto, GenerateJsonLdDto, GenerateProductDescriptionDto } from '../dto/content-generation.dto';
export declare class ContentController {
    private readonly contentService;
    private readonly auditService;
    private readonly generatorService;
    private readonly knowledgeAwareContentService;
    constructor(contentService: ContentService, auditService: ContentAuditService, generatorService: ContentGeneratorService, knowledgeAwareContentService: KnowledgeAwareContentService);
    generateSeoArticleFromKnowledge(req: any, body: {
        keyword?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        warnings?: undefined;
        context?: undefined;
    } | {
        success: boolean;
        data: SeoArticleResult;
        warnings: string[];
        context: {
            brandName: string;
            keyword: string;
        };
        message?: undefined;
    }>;
    generateFaqFromKnowledge(req: any, body: {
        faqType?: 'product' | 'service' | 'brand' | 'general';
    }): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        context?: undefined;
    } | {
        success: boolean;
        data: FaqResult;
        context: {
            brandName: string;
            faqType: string;
        };
        message?: undefined;
    }>;
    generateProductDescriptionFromKnowledge(req: any, body: {
        productName?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        context?: undefined;
    } | {
        success: boolean;
        data: ProductDescriptionResult;
        context: {
            productName: string;
            brandName: string | undefined;
        };
        message?: undefined;
    }>;
    checkWithKnowledge(req: any, body: {
        content: string;
    }): Promise<{
        success: boolean;
        message: string;
    } | {
        hasViolation: boolean;
        foundWords: string[];
        suggestions: string[];
        success: boolean;
        message?: undefined;
    }>;
    getBrandSummary(req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            name: string;
            industry: string;
            coreBiz: string;
            targetAudience: string;
            highlights: string[];
        };
        message?: undefined;
    }>;
    create(createContentDto: CreateContentDto, req: any): Promise<import("../entities/content.entity").Content>;
    findAll(query: QueryContentDto): Promise<import("../entities/content.entity").Content[]>;
    findOne(id: number): Promise<import("../entities/content.entity").Content>;
    update(id: number, updateData: Partial<CreateContentDto>, req: any): Promise<import("../entities/content.entity").Content>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
    generateSeoArticle(dto: GenerateSeoArticleDto): Promise<SeoArticleResult>;
    generateFaq(dto: GenerateFaqDto): Promise<FaqResult>;
    generateJsonLd(dto: GenerateJsonLdDto): Promise<JsonLdResult>;
    generateProductDescription(dto: GenerateProductDescriptionDto): Promise<ProductDescriptionResult>;
    optimizeContent(body: {
        content: string;
        type?: string;
    }): Promise<{
        content: string;
    }>;
    checkSensitiveWords(body: {
        content: string;
    }): Promise<{
        hasSensitive: boolean;
        words: string[];
    }>;
}
