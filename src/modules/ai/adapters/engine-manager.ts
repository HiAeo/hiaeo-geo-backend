import { Injectable } from '@nestjs/common';
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

@Injectable()
export class EngineManager {
  private engines: Map<string, any> = new Map();

  constructor(
    private deepseekAdapter: DeepseekAdapter,
    private kimiAdapter: KimiAdapter,
    private qwenAdapter: QwenAdapter,
    private zhipuAdapter: ZhipuAdapter,
    private doubaoAdapter: DoubaoAdapter,
    private wenxinAdapter: WenxinAdapter,
  ) {
    this.registerEngine(this.deepseekAdapter);
    this.registerEngine(this.kimiAdapter);
    this.registerEngine(this.qwenAdapter);
    this.registerEngine(this.zhipuAdapter);
    this.registerEngine(this.doubaoAdapter);
    this.registerEngine(this.wenxinAdapter);
  }

  private registerEngine(adapter: any): void {
    this.engines.set(adapter.name.toLowerCase(), adapter);
  }

  getEngine(name?: string): any {
    if (name) {
      return this.engines.get(name.toLowerCase()) || this.engines.get('deepseek');
    }
    return this.engines.get('deepseek');
  }

  getAvailableEngines(): string[] {
    return Array.from(this.engines.keys());
  }

  async diagnoseBrand(params: BrandDiagnosisParams, engine?: string): Promise<BrandDiagnosisResult> {
    const adapter = this.getEngine(engine);
    if (!adapter) {
      throw new Error(`Engine ${engine} not found`);
    }
    return adapter.diagnoseBrand(params);
  }

  async batchDiagnose(params: BrandDiagnosisParams, engines?: string[]): Promise<AggregatedDiagnosisResult> {
    const targetEngines = engines || this.getAvailableEngines();
    const results: Array<{ engine: string; result: BrandDiagnosisResult }> = [];
    const successfulResults: BrandDiagnosisResult[] = [];

    for (const engineName of targetEngines) {
      try {
        const adapter = this.getEngine(engineName);
        if (adapter) {
          const result = await adapter.diagnoseBrand(params);
          results.push({ engine: adapter.name, result });
          successfulResults.push(result);
        }
      } catch (error) {
        console.error(`诊断引擎 ${engineName} 失败:`, error.message);
      }
    }

    if (successfulResults.length === 0) {
      return {
        brandPositioning: '诊断失败',
        competitiveAdvantages: [],
        potentialIssues: ['所有AI引擎诊断均失败'],
        marketOpportunities: [],
        contentSuggestions: [],
        confidence: 0,
        engine: 'none',
        diagnosedAt: new Date(),
        diagnosisId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }

    const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
    const allAdvantages = successfulResults.flatMap(r => r.competitiveAdvantages);
    const allIssues = successfulResults.flatMap(r => r.potentialIssues);
    const allOpportunities = successfulResults.flatMap(r => r.marketOpportunities);
    const allSuggestions = successfulResults.flatMap(r => r.contentSuggestions);

    return {
      brandPositioning: successfulResults[0].brandPositioning,
      competitiveAdvantages: [...new Set(allAdvantages)].slice(0, 5),
      potentialIssues: [...new Set(allIssues)].slice(0, 5),
      marketOpportunities: [...new Set(allOpportunities)].slice(0, 5),
      contentSuggestions: [...new Set(allSuggestions)].slice(0, 5),
      confidence: avgConfidence,
      engine: successfulResults.map(r => r.confidence === Math.max(...successfulResults.map(sr => sr.confidence)) ? r.confidence.toString() : '').filter(Boolean)[0] || 'deepseek',
      diagnosedAt: new Date(),
      diagnosisId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async generateContent(params: ContentGenerationParams, engine?: string): Promise<ContentGenerationResult> {
    const adapter = this.getEngine(engine);
    if (!adapter) {
      throw new Error(`Engine ${engine} not found`);
    }
    return adapter.generateContent(params);
  }

  async chat(params: ChatParams, engine?: string): Promise<ChatResult> {
    const adapter = this.getEngine(engine);
    if (!adapter) {
      throw new Error(`Engine ${engine} not found`);
    }
    return adapter.chat(params);
  }

  async checkEnginesHealth(): Promise<EngineHealthStatus[]> {
    const statuses: EngineHealthStatus[] = [];

    for (const [name, adapter] of this.engines.entries()) {
      try {
        const healthy = await adapter.healthCheck();
        statuses.push({ name: adapter.name, healthy });
      } catch (error) {
        statuses.push({ name: adapter.name, healthy: false, error: error.message });
      }
    }

    return statuses;
  }
}
