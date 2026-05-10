import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../../knowledge/entities/brand-knowledge-base.entity';
import { GenerateSeoArticleDto, GenerateFaqDto, GenerateProductDescriptionDto } from '../dto/content-generation.dto';
export declare class KnowledgeAwareContentService {
    private knowledgeRepository;
    private readonly logger;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>);
    buildSeoArticleContext(organizationId: string, customKeyword?: string): Promise<GenerateSeoArticleDto | null>;
    buildFaqContext(organizationId: string, faqType?: 'product' | 'service' | 'brand' | 'general'): Promise<GenerateFaqDto | null>;
    buildProductDescriptionContext(organizationId: string, productName?: string): Promise<GenerateProductDescriptionDto | null>;
    getForbiddenWords(organizationId: string): Promise<string[]>;
    checkContentAgainstKnowledge(organizationId: string, content: string): Promise<{
        hasViolation: boolean;
        foundWords: string[];
        suggestions: string[];
    }>;
    getDifferentialAdvantage(organizationId: string): Promise<string | null>;
    getBrandSummary(organizationId: string): Promise<{
        name: string;
        industry: string;
        coreBiz: string;
        targetAudience: string;
        highlights: string[];
    } | null>;
    private getBrandName;
    private getPrimaryKeyword;
    private getLongTailKeywords;
    private getBrandInfo;
    private getCompetitorNames;
    private getTargetAudience;
}
