import { PublishPlatform } from '../dto/publish.dto';
export interface PlatformContent {
    title: string;
    body: string;
    excerpt?: string;
    keywords?: string[];
    coverImage?: string;
    tags?: string[];
    category?: string;
}
export interface PlatformPublishResult {
    success: boolean;
    contentId?: string;
    url?: string;
    error?: string;
    stats?: {
        views?: number;
        likes?: number;
        comments?: number;
        shares?: number;
    };
}
export interface PlatformAdapter {
    getPlatform(): PublishPlatform;
    getName(): string;
    isConfigured(): boolean;
    publish(content: PlatformContent): Promise<PlatformPublishResult>;
    getStatus(contentId: string): Promise<PlatformPublishResult>;
    delete(contentId: string): Promise<boolean>;
    update(contentId: string, content: PlatformContent): Promise<PlatformPublishResult>;
}
export declare abstract class PlatformAdapterFactory {
    static create(platform: PublishPlatform, config: Record<string, string>): PlatformAdapter | null;
}
export declare class WeiboAdapter implements PlatformAdapter {
    private config;
    constructor(config: Record<string, string>);
    getPlatform(): PublishPlatform;
    getName(): string;
    isConfigured(): boolean;
    publish(content: PlatformContent): Promise<PlatformPublishResult>;
    getStatus(contentId: string): Promise<PlatformPublishResult>;
    delete(contentId: string): Promise<boolean>;
    update(contentId: string, content: PlatformContent): Promise<PlatformPublishResult>;
}
export declare class WechatAdapter implements PlatformAdapter {
    private config;
    constructor(config: Record<string, string>);
    getPlatform(): PublishPlatform;
    getName(): string;
    isConfigured(): boolean;
    publish(content: PlatformContent): Promise<PlatformPublishResult>;
    getStatus(contentId: string): Promise<PlatformPublishResult>;
    delete(contentId: string): Promise<boolean>;
    update(contentId: string, content: PlatformContent): Promise<PlatformPublishResult>;
}
export declare class DouyinAdapter implements PlatformAdapter {
    private config;
    constructor(config: Record<string, string>);
    getPlatform(): PublishPlatform;
    getName(): string;
    isConfigured(): boolean;
    publish(content: PlatformContent): Promise<PlatformPublishResult>;
    getStatus(contentId: string): Promise<PlatformPublishResult>;
    delete(contentId: string): Promise<boolean>;
    update(contentId: string, content: PlatformContent): Promise<PlatformPublishResult>;
}
export declare class XiaohongshuAdapter implements PlatformAdapter {
    private config;
    constructor(config: Record<string, string>);
    getPlatform(): PublishPlatform;
    getName(): string;
    isConfigured(): boolean;
    publish(content: PlatformContent): Promise<PlatformPublishResult>;
    getStatus(contentId: string): Promise<PlatformPublishResult>;
    delete(contentId: string): Promise<boolean>;
    update(contentId: string, content: PlatformContent): Promise<PlatformPublishResult>;
}
export declare class BilibiliAdapter implements PlatformAdapter {
    private config;
    constructor(config: Record<string, string>);
    getPlatform(): PublishPlatform;
    getName(): string;
    isConfigured(): boolean;
    publish(content: PlatformContent): Promise<PlatformPublishResult>;
    getStatus(contentId: string): Promise<PlatformPublishResult>;
    delete(contentId: string): Promise<boolean>;
    update(contentId: string, content: PlatformContent): Promise<PlatformPublishResult>;
}
