import { DataSourceService } from './data-source.service';
export declare class HubService {
    private dataSource;
    constructor(dataSource: DataSourceService);
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
            stats: import("./data-source.service").BrandStats;
            brandId: string | undefined;
        };
    }>;
    getOpsView(brandId?: string, organizationId?: string): Promise<{
        success: boolean;
        data: {
            stats: import("./data-source.service").OpsStats;
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
    getTechView(brandId?: string, organizationId?: string): Promise<{
        success: boolean;
        data: {
            stats: import("./data-source.service").TechStats;
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
    getBrandRanking(organizationId?: string): Promise<{
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
    getVisibilityTrend(period?: string, organizationId?: string): Promise<{
        success: boolean;
        data: {
            date: string;
            value: number;
        }[];
        period: string;
    }>;
    getPendingTasks(brandId?: string, organizationId?: string): Promise<{
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
    getSuggestions(brandId?: string, organizationId?: string): Promise<{
        success: boolean;
        data: {
            text: string;
            tag: string;
            priority: "high" | "medium" | "low";
        }[];
        brandId: string | undefined;
    }>;
    private getTechTasks;
    private getTechReferences;
    private getJsonLdTemplate;
    private getMetaTemplate;
    private getSitemapTemplate;
}
