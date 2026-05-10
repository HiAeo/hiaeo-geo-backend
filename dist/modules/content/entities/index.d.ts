export declare class Content {
    id: string;
    title: string;
    body: string;
    contentType: string;
    brandId: string;
    userId: string;
    metadata: {
        keywords?: string[];
        metaTitle?: string;
        metaDescription?: string;
        wordCount?: number;
        readingTime?: number;
    };
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PublishRecord {
    id: string;
    contentId: string;
    content: Content;
    brandId: string;
    userId: string;
    platform: string;
    platformContentId: string;
    platformUrl: string;
    status: string;
    message: string;
    publishedAt: Date;
    scheduledTime: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MofaStrategy {
    id: string;
    name: string;
    strategyType: string;
    brandId: string;
    userId: string;
    content: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ContentAudit {
    id: string;
    contentId: string;
    userId: string;
    action: string;
    changes: Record<string, any>;
    createdAt: Date;
}
