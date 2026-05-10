import { WebScraperService, WebPageData } from './web-scraper.service';
import { DiagnosisTask } from '../entities/diagnosis-task.entity';
export interface SEODiagnosisResult {
    seoScore: {
        technical: number;
        content: number;
        authority: number;
        performance: number;
        overall: number;
    };
    issues: SEOIssue[];
    recommendations: SEORecommendation[];
    aiSearchPresence: {
        score: number;
        detected: boolean;
        types: string[];
    };
    summary: string;
    rawData?: WebPageData;
}
export interface SEOIssue {
    category: 'technical' | 'content' | 'authority' | 'performance';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    recommendation: string;
    affectedElement?: string;
    estimatedImpact?: number;
}
export interface SEORecommendation {
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    impact: string;
}
export declare class SEODiagnosisService {
    private webScraper;
    private readonly logger;
    constructor(webScraper: WebScraperService);
    diagnose(task: DiagnosisTask): Promise<SEODiagnosisResult>;
    private analyzeIssues;
    private generateRecommendations;
    private calculateSEOScore;
    private detectAISearchPresence;
    private generateSummary;
    private generateEmptyResult;
    private generateErrorResult;
    private estimateEffort;
}
