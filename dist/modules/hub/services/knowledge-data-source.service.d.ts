import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../../knowledge/entities/brand-knowledge-base.entity';
import { DiagnosisReport } from '../../diagnosis/entities/diagnosis-report.entity';
export declare class KnowledgeDataSourceService {
    private knowledgeRepository;
    private reportRepository;
    private readonly logger;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>, reportRepository: Repository<DiagnosisReport>);
    getKnowledgeHealthMetrics(organizationId: string): Promise<{
        completenessScore: number;
        healthLevel: 'excellent' | 'good' | 'fair' | 'poor';
        dimensionScores: Record<string, number>;
        lastDiagnosisScore: number | null;
        versionHistory: {
            version: number;
            date: string;
        }[];
        recommendations: string[];
    }>;
    getKnowledgeStats(organizationId: string): Promise<{
        totalOrganizations: number;
        withCompleteKnowledge: number;
        avgCompleteness: number;
        topIndustries: {
            industry: string;
            count: number;
        }[];
    }>;
    getCompletenessTrend(organizationId: string, days?: number): Promise<{
        trend: {
            date: string;
            score: number;
        }[];
        direction: 'up' | 'down' | 'stable';
        changePercent: number;
    }>;
    getKnowledgeDiagnosisCorrelation(organizationId: string): Promise<{
        diagnosisCount: number;
        avgScore: number;
        bestDimension: string;
        worstDimension: string;
        improvementTrend: 'improving' | 'declining' | 'stable';
    }>;
    private calculateCompleteness;
    private isFieldComplete;
    private getDimensionScores;
    private determineHealthLevel;
    private generateRecommendations;
}
