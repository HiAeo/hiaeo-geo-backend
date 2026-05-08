export interface GeneratedContent {
    title: string;
    body: string;
    type: string;
}
export declare class ContentGeneratorService {
    generateContent(prompt: string, type?: string): Promise<GeneratedContent>;
    optimizeContent(content: string): Promise<string>;
    checkSensitiveWords(content: string): Promise<{
        hasSensitive: boolean;
        words: string[];
    }>;
}
