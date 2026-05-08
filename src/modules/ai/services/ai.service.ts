import { Injectable } from '@nestjs/common';
import { EngineManager, AggregatedDiagnosisResult } from '../adapters/engine-manager';
import { BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';

@Injectable()
export class AiService {
  constructor(private engineManager: EngineManager) {}

  /**
   * 获取可用引擎列表
   */
  async getEngineList() {
    return this.engineManager.getAvailableEngines();
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
}
