import { Injectable } from '@nestjs/common';
import { EngineManager, AggregatedDiagnosisResult, EngineHealthStatus } from '../adapters/engine-manager';
import { BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';

@Injectable()
export class AiService {
  constructor(private engineManager: EngineManager) {}

  /**
   * 获取可用引擎列表
   */
  async getEngineList() {
    const engines = this.engineManager.getAvailableEngines();
    return engines.map(name => ({
      name,
      displayName: this.getEngineDisplayName(name),
    }));
  }

  /**
   * 获取引擎健康状态
   */
  async getEngineHealthStatus(): Promise<EngineHealthStatus[]> {
    return this.engineManager.checkEnginesHealth();
  }

  /**
   * 推荐最佳引擎
   */
  async recommendEngine(taskType: 'diagnosis' | 'content' | 'chat'): Promise<string> {
    const healthStatus = await this.engineManager.checkEnginesHealth();
    const healthyEngines = healthStatus.filter(s => s.healthy);
    
    if (healthyEngines.length === 0) {
      return 'deepseek'; // 默认
    }

    // 根据任务类型推荐
    switch (taskType) {
      case 'diagnosis':
        return 'deepseek'; // Deepseek适合分析任务
      case 'content':
        return 'kimi'; // Kimi适合创意内容
      case 'chat':
        return 'qwen'; // Qwen适合对话
      default:
        return healthyEngines[0].name;
    }
  }

  /**
   * 单引擎诊断
   */
  async diagnose(params: BrandDiagnosisParams, engineType?: string): Promise<BrandDiagnosisResult> {
    return this.engineManager.diagnoseBrand(params, engineType);
  }

  /**
   * 多引擎批量诊断
   */
  async diagnoseWithAllEngines(params: BrandDiagnosisParams): Promise<AggregatedDiagnosisResult> {
    return this.engineManager.batchDiagnose(params);
  }

  /**
   * 生成内容
   */
  async generateContent(params: ContentGenerationParams, engineType?: string) {
    return this.engineManager.generateContent(params, engineType);
  }

  /**
   * 聊天对话
   */
  async chat(params: ChatParams, engineType?: string): Promise<ChatResult> {
    return this.engineManager.chat(params, engineType);
  }

  private getEngineDisplayName(name: string): string {
    const names: Record<string, string> = {
      deepseek: 'DeepSeek',
      kimi: 'Kimi',
      qwen: '通义千问',
      zhipu: '智谱AI',
      doubao: '豆包',
      wenxin: '文心一言',
    };
    return names[name] || name;
  }
}
