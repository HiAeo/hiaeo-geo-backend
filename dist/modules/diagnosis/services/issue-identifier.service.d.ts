import { IssueAnalysisResult } from '../interfaces/diagnosis.interface';
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
    issues: {
        id: string;
        title: string;
        description: string;
        severity: string;
        impact: string;
        solution: string;
    }[];
}
export declare class IssueIdentifierService {
    identify(aiResult: AIAnalysisResult, enginesUsed: string[]): IssueAnalysisResult;
    private extractFromAIResult;
    private identifyPotentialIssues;
    private identifyDescribedIssues;
    private normalizeSeverity;
    private inferAffectedDimension;
    private estimateScoreImpact;
    private estimateEffort;
    private estimateEffortFromScore;
    private calculatePriority;
    private categorizeIssue;
    private inferSeverityFromProblem;
    private getGenericSolution;
    private deduplicateAndSort;
    private calculateSummary;
}
export {};
