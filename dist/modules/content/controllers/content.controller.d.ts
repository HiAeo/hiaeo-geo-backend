import { ContentService } from '../services/content.service';
import { ContentAuditService } from '../services/content-audit.service';
import { ContentGeneratorService, SeoArticleResult, FaqResult, JsonLdResult, ProductDescriptionResult } from '../services/content-generator.service';
import { CreateContentDto, QueryContentDto, GenerateSeoArticleDto, GenerateFaqDto, GenerateJsonLdDto, GenerateProductDescriptionDto } from '../dto/content-generation.dto';
export declare class ContentController {
    private readonly contentService;
    private readonly auditService;
    private readonly generatorService;
    constructor(contentService: ContentService, auditService: ContentAuditService, generatorService: ContentGeneratorService);
    create(createContentDto: CreateContentDto, req: any): Promise<import("../entities").Content>;
    findAll(query: QueryContentDto): Promise<import("../entities").Content[]>;
    findOne(id: number): Promise<import("../entities").Content>;
    update(id: number, updateData: Partial<CreateContentDto>, req: any): Promise<import("../entities").Content>;
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
