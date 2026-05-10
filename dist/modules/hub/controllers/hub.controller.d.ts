import { HubService } from '../services/hub.service';
import { KnowledgeDataSourceService } from '../services/knowledge-data-source.service';
export declare class HubController {
    private readonly hubService;
    private readonly knowledgeDataSourceService;
    constructor(hubService: HubService, knowledgeDataSourceService: KnowledgeDataSourceService);
    getKnowledgeHealth(req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            completenessScore: number;
            healthLevel: "excellent" | "good" | "fair" | "poor";
            dimensionScores: Record<string, number>;
            lastDiagnosisScore: number | null;
            versionHistory: {
                version: number;
                date: string;
            }[];
            recommendations: string[];
        };
        message?: undefined;
    }>;
    getKnowledgeStats(): Promise<{
        success: boolean;
        data: {
            totalOrganizations: number;
            withCompleteKnowledge: number;
            avgCompleteness: number;
            topIndustries: {
                industry: string;
                count: number;
            }[];
        };
    }>;
    getKnowledgeTrend(req: any, days?: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            trend: {
                date: string;
                score: number;
            }[];
            direction: "up" | "down" | "stable";
            changePercent: number;
        };
        message?: undefined;
    }>;
    getKnowledgeDiagnosisCorrelation(req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            diagnosisCount: number;
            avgScore: number;
            bestDimension: string;
            worstDimension: string;
            improvementTrend: "improving" | "declining" | "stable";
        };
        message?: undefined;
    }>;
    getStats(brandId?: string): Promise<{
        success: boolean;
        data: {
            brandId: string | undefined;
            totalUsers: number;
            activeUsers: number;
            totalCredits: number;
            monthlyRevenue: number;
            freeUsers: number;
            proUsers: number;
            enterpriseUsers: number;
            totalBrands: number;
            totalDiagnoses: number;
            completedDiagnoses: number;
            totalContent: number;
            publishedContent: number;
        };
    }>;
    getBossView(brandId?: string): Promise<{
        success: boolean;
        data: {
            stats: import("../services/data-source.service").BrandStats;
            brandId: string | undefined;
        };
    }>;
    getOpsView(brandId?: string): Promise<{
        success: boolean;
        data: {
            stats: import("../services/data-source.service").OpsStats;
            pendingTasks: {
                id: string;
                title: string;
                style: string;
                platform: string;
                impact: number;
                status: string;
            }[];
            suggestions: {
                text: string;
                tag: string;
                priority: "high" | "medium" | "low";
            }[];
            brandId: string | undefined;
        };
    }>;
    getTechView(brandId?: string): Promise<{
        success: boolean;
        data: {
            stats: import("../services/data-source.service").TechStats;
            tasks: {
                id: number;
                title: string;
                description: string;
                status: string;
            }[];
            references: {
                type: string;
                icon: string;
                title: string;
                description: string;
                code: string;
            }[];
            brandId: string | undefined;
        };
    }>;
    getBrandRanking(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            score: number;
            mentionRate: number;
            trend: number;
            isCurrentBrand: boolean;
        }[];
    }>;
    getVisibilityTrend(period?: string): Promise<{
        success: boolean;
        data: {
            date: string;
            value: number;
        }[];
        period: string;
    }>;
    getPendingTasks(brandId?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            title: string;
            style: string;
            platform: string;
            impact: number;
            status: string;
        }[];
        brandId: string | undefined;
    }>;
    getSuggestions(brandId?: string): Promise<{
        success: boolean;
        data: {
            text: string;
            tag: string;
            priority: "high" | "medium" | "low";
        }[];
        brandId: string | undefined;
    }>;
}
