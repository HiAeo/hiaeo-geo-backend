import { HealthScoreResult } from '../interfaces/diagnosis.interface';
interface DiagnosisDimensionConfig {
    name: string;
    enabled?: boolean;
    weight?: number;
}
interface AIAnalysisResult {
    diagnosisId: string;
    brandName: string;
    overallScore: number;
    dimensionScores: {
        name: string;
        score: number;
        analysis: string;
        problems: string[];
    }[];
    suggestions: string[];
    issues: any[];
}
export declare class HealthScoreCalculatorService {
    private readonly defaultWeights;
    calculate(aiResult: AIAnalysisResult, customDimensions?: DiagnosisDimensionConfig[]): HealthScoreResult;
    private processDimensionScores;
    private calculateWeightedScore;
    private determineGrade;
    private calculateHealthLevel;
    private identifyRiskFactors;
    private getRecommendation;
    private analyzeTrends;
    calculateImprovementPotential(currentScore: number, targetScore: number): {
        improvementNeeded: number;
        estimatedEffort: 'low' | 'medium' | 'high';
        priorityDimensions: string[];
    };
    exportReportData(result: HealthScoreResult): Record<string, any>;
}
export {};
