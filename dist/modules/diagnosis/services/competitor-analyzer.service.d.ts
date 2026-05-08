import { EngineManager } from '../../ai/adapters/engine-manager';
import { AiService } from '../../ai/services/ai.service';
export interface CompetitorComparison {
    competitorName: string;
    overallScore?: number;
    dimensionScores?: any[];
    strengths: string[];
    weaknesses: string[];
    gap: number;
}
export interface CompetitorAnalysisResult {
    selfBrand: string;
    competitors: CompetitorComparison[];
    positioningMap: {
        x: number;
        y: number;
        label: string;
        type: 'self' | 'competitor';
    }[];
    marketGaps: string[];
    recommendations: string[];
}
export declare class CompetitorAnalyzerService {
    private engineManager;
    private aiService;
    constructor(engineManager: EngineManager, aiService: AiService);
    analyzeCompetitors(brandName: string, competitors: string[], engine?: string): Promise<CompetitorAnalysisResult>;
    private identifyMarketGaps;
    private generateRecommendations;
    identifyCompetitorsFromMarket(text: string): Promise<string[]>;
    private extractCompetitorsFromText;
}
