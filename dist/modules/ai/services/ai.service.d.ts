import { EngineManager, AggregatedDiagnosisResult } from '../adapters/engine-manager';
import { BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';
export declare class AiService {
    private engineManager;
    constructor(engineManager: EngineManager);
    getEngineList(): Promise<string[]>;
    diagnose(params: BrandDiagnosisParams, engineType?: string): Promise<BrandDiagnosisResult>;
    diagnoseWithAllEngines(params: BrandDiagnosisParams): Promise<AggregatedDiagnosisResult>;
    generateContent(params: ContentGenerationParams, engineType?: string): Promise<import("../interfaces/ai-engine.interface").ContentGenerationResult>;
    chat(params: ChatParams, engineType?: string): Promise<ChatResult>;
}
