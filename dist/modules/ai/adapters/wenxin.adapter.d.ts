import { ConfigService } from '../../../config/config.service';
import { AIEngineAdapter, BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ContentGenerationResult, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';
export declare class WenxinAdapter implements AIEngineAdapter {
    private configService;
    readonly name = "Wenxin";
    private apiKey;
    private secretKey;
    private accessToken;
    private tokenExpiry;
    private baseUrl;
    constructor(configService: ConfigService);
    private getAccessToken;
    diagnoseBrand(params: BrandDiagnosisParams): Promise<BrandDiagnosisResult>;
    generateContent(params: ContentGenerationParams): Promise<ContentGenerationResult>;
    chat(params: ChatParams): Promise<ChatResult>;
    isAvailable(): boolean;
    diagnoseSEO(params: {
        targetUrl: string;
        targetName?: string;
        targetIndustry?: string;
        keywords?: string[];
    }): Promise<any>;
    private buildDiagnosisPrompt;
    private buildContentPrompt;
    private parseDiagnosisResult;
    private getMockDiagnosisResult;
    private getMockContent;
}
