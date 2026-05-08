import { DiagnosisType } from '../entities/diagnosis-task.entity';
export declare class DiagnosisDimensionConfigDto {
    name: string;
    enabled?: boolean;
    weight?: number;
}
export declare class CreateDiagnosisTaskDto {
    brandName: string;
    website?: string;
    industry?: string;
    targetMarket?: string;
    type?: DiagnosisType;
    engine?: string;
    dimensions?: DiagnosisDimensionConfigDto[];
    includeCompetitorAnalysis?: boolean;
    competitors?: string[];
}
