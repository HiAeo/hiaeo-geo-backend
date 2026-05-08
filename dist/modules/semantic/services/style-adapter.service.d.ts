export interface StyleConfig {
    tone: string;
    length: string;
    format: string;
    language: string;
}
export declare class StyleAdapterService {
    private readonly defaultStyle;
    adaptStyle(content: string, style: Partial<StyleConfig>): string;
    detectStyle(text: string): Promise<StyleConfig>;
    suggestStyle(topic: string): Promise<StyleConfig>;
}
