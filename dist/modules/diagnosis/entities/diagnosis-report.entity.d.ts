export declare enum ReportGrade {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    VERY_POOR = "very_poor"
}
export declare class DiagnosisReport {
    id: string;
    taskId: string;
    userId: string;
    organizationId: string;
    brandId: string;
    brandName: string;
    overallScore: number;
    grade: ReportGrade;
    healthLevel: number;
    dimensionScores: any[];
    competitorAnalysis: any;
    issues: any[];
    suggestions: any[];
    executiveSummary: string;
    aiInsights: string;
    rawAiResponse: Record<string, any>;
    enginesUsed: string[];
    createdAt: Date;
    updatedAt: Date;
}
