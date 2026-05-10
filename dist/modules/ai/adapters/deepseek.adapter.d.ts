import { ConfigService } from '../../../config/config.service';
import { AIEngineAdapter, BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ContentGenerationResult, ChatParams, ChatResult, SEODiagnosisParams, SEODiagnosisResult } from '../interfaces/ai-engine.interface';
export declare class DeepseekAdapter implements AIEngineAdapter {
    private configService;
    readonly name = "DeepSeek";
    private apiKey;
    private baseUrl;
    constructor(configService: ConfigService);
    diagnoseBrand(params: BrandDiagnosisParams): Promise<BrandDiagnosisResult>;
    generateContent(params: ContentGenerationParams): Promise<ContentGenerationResult>;
    chat(params: ChatParams): Promise<ChatResult>;
    healthCheck(): Promise<boolean>;
    isAvailable(): boolean;
    diagnoseSEO(params: SEODiagnosisParams): Promise<SEODiagnosisResult>;
    private buildSEODiagnosisPrompt;
    private parseSEODiagnosisResult;
    private getMockSEOResult;
    private buildDiagnosisPrompt;
    private buildContentPrompt;
    private parseDiagnosisResult;
    private getMockDiagnosisResult;
    private getMockContent;
}
