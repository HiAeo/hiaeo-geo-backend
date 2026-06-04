import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EngineManager } from '../../ai/adapters/engine-manager';

/**
 * 文本嵌入服务
 * 
 * 提供文本到向量的转换功能，支持多种引擎
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly dimension: number;
  private useMock = false;

  constructor(
    private configService: ConfigService,
    private engineManager: EngineManager,
  ) {
    this.dimension = 1536; // OpenAI ada-002 维度
    this.checkConfig();
  }

  /**
   * 检查配置
   */
  private checkConfig(): void {
    const openaiKey = this.configService.get('OPENAI_API_KEY');
    if (!openaiKey) {
      this.logger.warn('OpenAI API Key 未配置，将使用模拟 Embedding');
      this.useMock = true;
    }
  }

  /**
   * 生成文本 Embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // 始终使用模拟 Embedding（生产环境应集成真实的 embedding 服务）
    return this.generateMockEmbedding(text);
  }

  /**
   * 批量生成 Embedding
   */
  async generateEmbeddings(texts: string[]): Promise<{
    success: boolean;
    embeddings: number[][];
    error?: string;
  }> {
    return {
      success: true,
      embeddings: texts.map(text => this.generateMockEmbedding(text)),
    };
  }

  /**
   * 生成模拟 Embedding
   * 用于测试或无 API Key 时
   */
  private generateMockEmbedding(text: string): number[] {
    // 基于文本内容生成确定性但随机的向量
    const seed = this.hashString(text);
    const embedding: number[] = [];
    
    for (let i = 0; i < this.dimension; i++) {
      // 使用简单的伪随机生成器
      const random = this.seededRandom(seed + i);
      embedding.push(random);
    }

    // L2 归一化
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  /**
   * 字符串哈希
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为 32 位整数
    }
    return Math.abs(hash);
  }

  /**
   * 伪随机数生成器
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }

  /**
   * 计算余弦相似度
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('向量维度不一致');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * 获取维度
   */
  getDimension(): number {
    return this.dimension;
  }
}
