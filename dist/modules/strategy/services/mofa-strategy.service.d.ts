import { AiService } from '../../ai/services/ai.service';
import { GenerateMofaStrategyDto, StrategyType, MofaStrategyResultDto } from '../dto/mofa-strategy.dto';
export declare class MofaStrategyService {
    private aiService;
    private strategies;
    constructor(aiService: AiService);
    generateStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto>;
    getStrategyList(filters: {
        brandId?: string;
        strategyType?: StrategyType;
        status?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: MofaStrategyResultDto[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getStrategyById(id: string): Promise<MofaStrategyResultDto | null>;
    updateStrategy(id: string, updates: Partial<MofaStrategyResultDto>): Promise<MofaStrategyResultDto | null>;
    deleteStrategy(id: string): Promise<boolean>;
    activateStrategy(id: string): Promise<MofaStrategyResultDto | null>;
    generateCompetitorStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto>;
    generateProductStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto>;
    generateFaqStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto>;
    private buildStrategyPrompt;
    private parseStrategyContent;
    private normalizeStrategyContent;
    private generateDefaultPlatformPlan;
    private generateDefaultTimeline;
    private generateSampleStrategy;
    private getDefaultStrategyContent;
    private getStrategyTypeName;
    private getPlatformName;
}
