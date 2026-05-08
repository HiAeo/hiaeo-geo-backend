import { DeepseekAdapter } from './deepseek.adapter';
import { KimiAdapter } from './kimi.adapter';
import { QwenAdapter } from './qwen.adapter';
import { ZhipuAdapter } from './zhipu.adapter';
import { DoubaoAdapter } from './doubao.adapter';
import { WenxinAdapter } from './wenxin.adapter';
import { BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ContentGenerationResult, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';
export interface AggregatedDiagnosisResult {
    brandPositioning: string;
    competitiveAdvantages: string[];
    potentialIssues: string[];
    marketOpportunities: string[];
    contentSuggestions: string[];
    confidence: number;
    engine: string;
    diagnosedAt: Date;
    diagnosisId: string;
}
export interface EngineHealthStatus {
    name: string;
    healthy: boolean;
    error?: string;
}
export declare class EngineManager {
    private deepseekAdapter;
    private kimiAdapter;
    private qwenAdapter;
    private zhipuAdapter;
    private doubaoAdapter;
    private wenxinAdapter;
    private engines;
    constructor(deepseekAdapter: DeepseekAdapter, kimiAdapter: KimiAdapter, qwenAdapter: QwenAdapter, zhipuAdapter: ZhipuAdapter, doubaoAdapter: DoubaoAdapter, wenxinAdapter: WenxinAdapter);
    private registerEngine;
    getEngine(name?: string): any;
    getAvailableEngines(): string[];
    diagnoseBrand(params: BrandDiagnosisParams, engine?: string): Promise<BrandDiagnosisResult>;
    batchDiagnose(params: BrandDiagnosisParams, engines?: string[]): Promise<AggregatedDiagnosisResult>;
    generateContent(params: ContentGenerationParams, engine?: string): Promise<ContentGenerationResult>;
    chat(params: ChatParams, engine?: string): Promise<ChatResult>;
    checkEnginesHealth(): Promise<EngineHealthStatus[]>;
}
