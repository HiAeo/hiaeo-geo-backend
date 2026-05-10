import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../../knowledge/entities/brand-knowledge-base.entity';
import { GenerateMofaStrategyDto, StrategyType } from '../dto/mofa-strategy.dto';
export declare class KnowledgeAwareStrategyService {
    private knowledgeRepository;
    private readonly logger;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>);
    getKnowledgeContextForStrategy(organizationId: string): Promise<{
        brandName: string;
        productDescription: string;
        targetAudience: string;
        industry: string;
        keywords: string[];
        competitors: string[];
        brandStrengths: string;
        brandChallenges: string;
        geoTarget: string;
        forbiddenWords: string[];
    } | null>;
    generateStrategyFromKnowledge(organizationId: string, strategyType: StrategyType): Promise<{
        success: boolean;
        data?: GenerateMofaStrategyDto;
        error?: string;
    }>;
    validateStrategyConsistency(organizationId: string, strategy: any): Promise<{
        valid: boolean;
        warnings: string[];
        suggestions: string[];
    }>;
    getStrategyRecommendationsFromDiagnosis(organizationId: string, diagnosisReport: any): Promise<string[]>;
    private getBrandName;
    private getProductDescription;
    private getTargetAudience;
    private getKeywords;
    private getCompetitors;
    private getBrandStrengths;
    private getBrandChallenges;
    private getGeoTarget;
    private getForbiddenWords;
    private getTargetPlatformsFromGoals;
}
