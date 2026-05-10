import { StrategyService } from '../services/strategy.service';
import { MofaStrategyService } from '../services/mofa-strategy.service';
import { KnowledgeAwareStrategyService } from '../services/knowledge-aware-strategy.service';
import { CreateStrategyDto, UpdateStrategyDto, GenerateStrategyFromReportDto } from '../dto/strategy.dto';
import { StrategyType } from '../dto/mofa-strategy.dto';
export declare class StrategyController {
    private readonly strategyService;
    private readonly mofaStrategyService;
    private readonly knowledgeAwareStrategyService;
    constructor(strategyService: StrategyService, mofaStrategyService: MofaStrategyService, knowledgeAwareStrategyService: KnowledgeAwareStrategyService);
    generateFromKnowledge(req: any, body: {
        strategyType?: StrategyType;
    }): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        context?: undefined;
    } | {
        success: boolean;
        data: import("../dto/mofa-strategy.dto").MofaStrategyResultDto;
        context: {
            brandName: string;
            keywords: string[] | undefined;
        };
        message: string;
    }>;
    getKnowledgeContext(req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
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
        };
        message?: undefined;
    }>;
    validateConsistency(req: any, body: {
        strategy: any;
    }): Promise<{
        success: boolean;
        message: string;
    } | {
        valid: boolean;
        warnings: string[];
        suggestions: string[];
        success: boolean;
        message?: undefined;
    }>;
    generateFromReport(userId: string, dto: GenerateStrategyFromReportDto): Promise<{
        success: boolean;
        data: import("../entities/strategy.entity").Strategy;
        message: string;
    }>;
    generate(userId: string, data: any): Promise<{
        success: boolean;
        data: import("../entities/strategy.entity").Strategy;
        message: string;
    }>;
    getList(userId: string, brandId?: string, status?: string): Promise<{
        success: boolean;
        data: {
            list: import("../entities/strategy.entity").Strategy[];
            total: number;
        };
    }>;
    getById(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../entities/strategy.entity").Strategy;
        message?: undefined;
    }>;
    create(userId: string, dto: CreateStrategyDto): Promise<{
        success: boolean;
        data: import("../entities/strategy.entity").Strategy;
        message: string;
    }>;
    update(id: string, dto: UpdateStrategyDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../entities/strategy.entity").Strategy;
        message: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    execute(id: string): Promise<{
        success: boolean;
        data: {
            executionId: string | undefined;
        };
        message: string;
    }>;
}
