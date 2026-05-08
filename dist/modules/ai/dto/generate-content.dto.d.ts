export declare enum ContentType {
    SOCIAL_POST = "social_post",
    ARTICLE = "article",
    AD_COPY = "ad_copy",
    PRODUCT_DESCRIPTION = "product_description"
}
export declare class GenerateContentDto {
    contentType: 'social_post' | 'article' | 'ad_copy' | 'product_description';
    topic: string;
    tone?: 'professional' | 'casual' | 'humorous' | 'inspirational';
    targetAudience?: string;
    keywords?: string[];
    maxLength?: number;
}
