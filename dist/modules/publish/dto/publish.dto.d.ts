export declare enum PublishPlatform {
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
    JD = "jd",
    CUSTOM = "custom"
}
export declare enum PublishContentType {
    SEO_ARTICLE = "seo_article",
    FAQ = "faq",
    JSON_LD = "json_ld",
    PRODUCT_DESCRIPTION = "product_description",
    SOCIAL_POST = "social_post",
    VIDEO_SCRIPT = "video_script",
    AD_COPY = "ad_copy"
}
export declare enum PublishStatus {
    DRAFT = "draft",
    PENDING = "pending",
    PUBLISHING = "publishing",
    PUBLISHED = "published",
    FAILED = "failed",
    SCHEDULED = "scheduled"
}
export declare class PlatformConfig {
    platform: PublishPlatform;
    enabled?: boolean;
    config?: string;
    isDraft?: boolean;
    scheduledTime?: string;
    category?: string;
    tags?: string[];
    coverImage?: string;
}
export declare class PublishContentDto {
    title: string;
    body: string;
    excerpt?: string;
    contentType: PublishContentType;
    keywords?: string[];
    metaTitle?: string;
    metaDescription?: string;
    targetPlatforms: PlatformConfig[];
    brandId?: string;
    sourceContentId?: string;
    additionalData?: string;
}
export declare class BatchPublishDto {
    contentIds: string[];
    targetPlatforms: PlatformConfig[];
}
export declare class PublishResultDto {
    id: string;
    title: string;
    status: PublishStatus;
    platformResults: PlatformPublishResult[];
    createdAt: Date;
    publishedAt?: Date;
}
export declare class PlatformPublishResult {
    platform: PublishPlatform;
    platformName: string;
    status: PublishStatus;
    message?: string;
    platformContentId?: string;
    platformUrl?: string;
    error?: string;
    publishedAt?: Date;
}
export declare class QueryPublishDto {
    brandId?: string;
    contentType?: PublishContentType;
    status?: PublishStatus;
    platform?: PublishPlatform;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
export declare enum ExportFormat {
    TXT = "txt",
    HTML = "html",
    MD = "md",
    JSON = "json",
    DOCX = "docx",
    PDF = "pdf"
}
export declare class ExportContentDto {
    contentIds: string[];
    format?: ExportFormat;
    includeMetadata?: boolean;
    fileName?: string;
}
