export declare enum StrategyType {
    CONTENT = "content",
    FAQ = "faq",
    PRODUCT = "product",
    COMPETITOR = "competitor",
    SEO = "seo",
    SOCIAL = "social"
}
export declare enum ContentPlatform {
    WEBSITE = "website",
    WECHAT = "wechat",
    WECHAT_MOMENTS = "wechat_moments",
    WEIBO = "weibo",
    DOUYIN = "douyin",
    XIAOHONGSHU = "xiaohongshu",
    BILIBILI = "bilibili",
    BAIDU = "baidu",
    TAOBAO = "taobao",
    TMALL = "tmall",
    JD = "jd"
}
export declare class GenerateMofaStrategyDto {
    brandName: string;
    brandId?: string;
    strategyType: StrategyType;
    keywords?: string[];
    targetPlatforms?: ContentPlatform[];
    targetAudience?: string;
    competitors?: string;
    productDescription?: string;
    industry?: string;
    budget?: string;
    planningWeeks?: number;
    brandStrengths?: string;
    brandChallenges?: string;
}
export declare class MofaStrategyContent {
    summary: string;
    coreObjectives: string[];
    kpis: {
        name: string;
        target: string;
        current?: string;
    }[];
    contentThemes: {
        theme: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
    }[];
    contentTypeDistribution: {
        type: string;
        percentage: number;
        examples: string[];
    }[];
    coreKeywords: {
        keyword: string;
        searchVolume: string;
        difficulty: string;
        priority: 'high' | 'medium' | 'low';
    }[];
    longTailKeywords: {
        keyword: string;
        intent: string;
        opportunity: string;
    }[];
    platformPlan: {
        platform: ContentPlatform;
        contentTypes: string[];
        postingFrequency: string;
        keyMetrics: string[];
        budget: string;
    }[];
    timeline: {
        phase: string;
        duration: string;
        startWeek: number;
        endWeek: number;
        tasks: {
            task: string;
            deliverable: string;
            owner: string;
        }[];
        milestones: string[];
    }[];
    competitorAnalysis?: {
        competitor: string;
        strengths: string[];
        weaknesses: string[];
        contentStrategy: string;
        opportunity: string;
    }[];
    recommendations: string[];
    risks: {
        risk: string;
        probability: 'high' | 'medium' | 'low';
        mitigation: string;
    }[];
    resourceRequirements: {
        type: string;
        quantity: string;
        cost: string;
    }[];
}
export declare class MofaStrategyResultDto {
    id: string;
    name: string;
    type: StrategyType;
    brandName: string;
    status: string;
    content: MofaStrategyContent;
    createdAt: Date;
    updatedAt: Date;
}
export declare class QueryMofaStrategyDto {
    brandId?: string;
    strategyType?: StrategyType;
    status?: string;
    page?: number;
    pageSize?: number;
}
