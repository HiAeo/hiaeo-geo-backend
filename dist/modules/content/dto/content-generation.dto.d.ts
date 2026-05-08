export declare enum ContentType {
    SEO_ARTICLE = "seo_article",
    FAQ = "faq",
    JSON_LD = "json_ld",
    PRODUCT_DESCRIPTION = "product_description",
    SOCIAL_POST = "social_post"
}
export declare class GenerateSeoArticleDto {
    brandName: string;
    keyword: string;
    longTailKeywords?: string;
    targetWordCount?: number;
    brandInfo?: string;
    competitors?: string;
}
export declare class GenerateFaqDto {
    name: string;
    faqType: string;
    questionCount?: number;
    targetAudience?: string;
}
export declare class GenerateJsonLdDto {
    schemaType: string;
    name: string;
    websiteUrl?: string;
    logoUrl?: string;
    contactEmail?: string;
    socialLinks?: string;
    description?: string;
    price?: string;
}
export declare class GenerateProductDescriptionDto {
    productName: string;
    category: string;
    features?: string;
    targetAudience?: string;
    brandName?: string;
}
export declare class CreateContentDto {
    title: string;
    body: string;
    type: ContentType;
    brandId?: number;
    metaDescription?: string;
    keywords?: string;
    tags?: string;
}
export declare class QueryContentDto {
    type?: ContentType;
    brandId?: number;
    page?: number;
    pageSize?: number;
}
