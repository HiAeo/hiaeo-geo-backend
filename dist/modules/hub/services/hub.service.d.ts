export declare class HubService {
    private stats;
    private bossStats;
    private techStats;
    private opsStats;
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
        };
    }>;
    getBossView(brandId?: string): Promise<{
        success: boolean;
        data: {
            stats: {
                geoScore: number;
                industryAvg: number;
                mentionRate: number;
                mentionTarget: number;
                competitorSuppression: number;
                competitorCount: number;
                roi: number;
            };
            brandId: string | undefined;
        };
    }>;
    getOpsView(brandId?: string): Promise<{
        success: boolean;
        data: {
            stats: {
                pendingCount: number;
                totalContent: number;
                publishedContent: number;
                pendingContent: number;
                avgEngagement: number;
            };
            pendingTasks: {
                success: boolean;
                data: {
                    id: number;
                    title: string;
                    style: string;
                    platform: string;
                    impact: number;
                    status: string;
                }[];
                brandId: string | undefined;
            };
            suggestions: {
                success: boolean;
                data: {
                    text: string;
                    tag: string;
                    priority: string;
                }[];
                brandId: string | undefined;
            };
            brandId: string | undefined;
        };
    }>;
    getTechView(brandId?: string): Promise<{
        success: boolean;
        data: {
            stats: {
                apiHealth: number;
                crawlerScore: number;
                schemaScore: number;
                performance: number;
                pendingTasks: number;
            };
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
            id: number;
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
            id: number;
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
            priority: string;
        }[];
        brandId: string | undefined;
    }>;
    private getTechTasks;
    private getTechReferences;
    private getJsonLdTemplate;
    private getMetaTemplate;
    private getSitemapTemplate;
}
