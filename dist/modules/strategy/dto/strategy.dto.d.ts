import { StrategyType } from '../entities/strategy.entity';
export declare class CreateStrategyDto {
    brandId: string;
    userId?: string;
    name: string;
    type?: StrategyType;
    keywords?: string[];
    channels?: string[];
    diagnosisReportId?: string;
}
export declare class UpdateStrategyDto {
    name?: string;
    status?: string;
    content?: any;
}
export declare class GenerateStrategyFromReportDto {
    diagnosisReportId: string;
    brandId: string;
    userId?: string;
    name?: string;
    type?: StrategyType;
}
