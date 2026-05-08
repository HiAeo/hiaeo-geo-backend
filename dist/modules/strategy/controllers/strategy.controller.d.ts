import { StrategyService } from '../services/strategy.service';
export declare class StrategyController {
    private readonly strategyService;
    constructor(strategyService: StrategyService);
    getList(brandId?: string, status?: string): Promise<{
        list: import("../services/strategy.service").Strategy[];
        total: number;
    }>;
    getById(id: string): Promise<import("../services/strategy.service").Strategy | null>;
    generate(data: any): Promise<import("../services/strategy.service").Strategy>;
    update(id: string, data: any): Promise<import("../services/strategy.service").Strategy | null>;
    delete(id: string): Promise<boolean>;
    execute(id: string): Promise<{
        success: boolean;
        message: string;
        executionId?: string;
    }>;
}
