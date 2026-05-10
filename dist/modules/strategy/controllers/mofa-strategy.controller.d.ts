import { MofaStrategyService } from '../services/mofa-strategy.service';
import { GenerateMofaStrategyDto, QueryMofaStrategyDto } from '../dto/mofa-strategy.dto';
export declare class MofaStrategyController {
    private readonly mofaStrategyService;
    constructor(mofaStrategyService: MofaStrategyService);
    generateStrategy(dto: GenerateMofaStrategyDto): Promise<import("../dto/mofa-strategy.dto").MofaStrategyResultDto>;
    getStrategyList(query: QueryMofaStrategyDto): Promise<{
        list: import("../dto/mofa-strategy.dto").MofaStrategyResultDto[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getStrategyById(id: string): Promise<import("../dto/mofa-strategy.dto").MofaStrategyResultDto | null>;
    updateStrategy(id: string, updates: any): Promise<import("../dto/mofa-strategy.dto").MofaStrategyResultDto | null>;
    deleteStrategy(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    activateStrategy(id: string): Promise<import("../dto/mofa-strategy.dto").MofaStrategyResultDto | null>;
    generateCompetitorStrategy(dto: GenerateMofaStrategyDto): Promise<import("../dto/mofa-strategy.dto").MofaStrategyResultDto>;
    generateProductStrategy(dto: GenerateMofaStrategyDto): Promise<import("../dto/mofa-strategy.dto").MofaStrategyResultDto>;
    generateFaqStrategy(dto: GenerateMofaStrategyDto): Promise<import("../dto/mofa-strategy.dto").MofaStrategyResultDto>;
}
