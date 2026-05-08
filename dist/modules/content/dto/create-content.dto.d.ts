export declare enum ContentStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare class CreateContentDto {
    title: string;
    body: string;
    type?: string;
    status?: ContentStatus;
    tags?: string;
    categoryId?: number;
}
