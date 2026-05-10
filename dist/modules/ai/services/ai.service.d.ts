import { EngineManager, AggregatedDiagnosisResult, EngineHealthStatus } from '../adapters/engine-manager';
import { BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';
export declare class AiService {
    private engineManager;
    constructor(engineManager: EngineManager);
    getEngineList(): Promise<{
        name: string;
        displayName: string;
    }[]>;
    getEngineHealthStatus(): Promise<EngineHealthStatus[]>;
    recommendEngine(taskType: 'diagnosis' | 'content' | 'chat'): Promise<string>;
    diagnose(params: BrandDiagnosisParams, engineType?: string): Promise<BrandDiagnosisResult>;
    diagnoseWithAllEngines(params: BrandDiagnosisParams): Promise<AggregatedDiagnosisResult>;
    generateContent(params: ContentGenerationParams, engineType?: string): Promise<import("../interfaces/ai-engine.interface").ContentGenerationResult>;
    chat(params: ChatParams, engineType?: string): Promise<ChatResult>;
    private getEngineDisplayName;
}
