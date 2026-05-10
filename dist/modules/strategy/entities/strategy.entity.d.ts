export declare enum StrategyStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum StrategyType {
    CONTENT = "content",
    SEO = "seo",
    SOCIAL = "social",
    MOFA = "mofa",
    HYBRID = "hybrid"
}
export declare class Strategy {
    id: string;
    brandId: string;
    userId: string;
    name: string;
    type: StrategyType;
    status: StrategyStatus;
    content: StrategyContent;
    diagnosisReportId: string;
    summary: string;
    targetKeywords: string[];
    targetChannels: string[];
    executionProgress: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface StrategyContent {
    objectives: string[];
    keywords: string[];
    channels: string[];
    contentTypes: string[];
    timeline: {
        phase: string;
        duration: string;
        tasks: string[];
        milestones: string[];
    }[];
    recommendations: {
        priority: number;
        title: string;
        description: string;
        expectedImpact: string;
        effort: 'low' | 'medium' | 'high';
    }[];
    kpis: {
        name: string;
        target: number;
        current: number;
    }[];
}
