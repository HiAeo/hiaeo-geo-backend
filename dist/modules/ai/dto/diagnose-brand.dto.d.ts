export declare class DiagnosisDimensionDto {
    name: string;
    weight: number;
    enabled: boolean;
}
export declare class DiagnoseBrandDto {
    brandName: string;
    website?: string;
    industry?: string;
    targetMarket?: string;
    dimensions?: DiagnosisDimensionDto[];
}
