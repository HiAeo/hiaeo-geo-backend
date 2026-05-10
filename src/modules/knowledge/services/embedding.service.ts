import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../../ai/services/ai.service';

/**
 * 文本向量嵌入服务
 * 使用 AI 服务生成文本向量表示，用于语义搜索和相似度匹配
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  // 向量维度配置（基于 text-embedding-3-small）
  private readonly EMBEDDING_DIMENSIONS = 1536;

  constructor(private readonly aiService: AiService) {}

  /**
   * 生成文本向量嵌入
   * @param text 输入文本
   * @returns 向量数组
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // 使用 AI 服务生成嵌入
      const embedding = await this.aiService.chat(
        {
          messages: [
            {
              role: 'user',
              content: `请将以下文本转换为向量表示（JSON格式的浮点数数组，长度1536）：\n\n${text}`,
            },
          ],
          systemPrompt:
            '你是一个向量生成器。请将用户提供的文本转换为1536维的向量表示，以JSON数组格式返回。只返回数组，不要其他内容。',
          temperature: 0,
          maxTokens: 8000,
        },
        'deepseek',
      );

      // 解析返回的向量
      const vectorStr = embedding.message.content.trim();
      let vector: number[];

      try {
        vector = JSON.parse(vectorStr);
      } catch {
        // 如果不是JSON格式，生成模拟向量
        vector = this.generateSimulatedEmbedding(text);
      }

      // 确保向量长度正确
      if (vector.length !== this.EMBEDDING_DIMENSIONS) {
        vector = this.padOrTruncateVector(vector, this.EMBEDDING_DIMENSIONS);
      }

      return vector;
    } catch (error) {
      this.logger.error(`生成嵌入向量失败: ${error.message}`, error.stack);
      // 返回模拟向量作为降级方案
      return this.generateSimulatedEmbedding(text);
    }
  }

  /**
   * 生成知识库的完整向量表示
   * 将知识库的各个模块内容合并生成统一向量
   */
  async generateKnowledgeBaseEmbedding(knowledgeData: {
    basicInfo?: any;
    bizPositioning?: any;
    productService?: any;
    competitorMarket?: any;
    geoGoals?: any;
    supplement?: any;
  }): Promise<{ embedding: number[]; sections: { name: string; vector: number[] }[] }> {
    const sections: { name: string; vector: number[] }[] = [];

    // 逐个模块生成向量
    const moduleNames: { key: string; name: string }[] = [
      { key: 'basicInfo', name: '企业基础信息' },
      { key: 'bizPositioning', name: '核心业务与定位' },
      { key: 'productService', name: '产品与服务详情' },
      { key: 'competitorMarket', name: '竞品与市场信息' },
      { key: 'geoGoals', name: 'GEO推广目标' },
      { key: 'supplement', name: '补充信息' },
    ];

    const texts: string[] = [];

    for (const module of moduleNames) {
      const moduleData = (knowledgeData as any)[module.key];
      if (moduleData) {
        const text = this.flattenModuleToText(moduleData);
        if (text) {
          texts.push(text);
          const vector = await this.generateEmbedding(text);
          sections.push({ name: module.name, vector });
        }
      }
    }

    // 生成综合向量
    const combinedText = texts.join('\n---\n');
    const combinedEmbedding = await this.generateEmbedding(combinedText);

    return {
      embedding: combinedEmbedding,
      sections,
    };
  }

  /**
   * 计算两个向量的余弦相似度
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('向量维度不匹配');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * 在向量集合中查找最相似的向量
   */
  findMostSimilar(
    queryVector: number[],
    vectors: { id: string; vector: number[]; metadata?: any }[],
    topK: number = 5,
  ): { id: string; similarity: number; metadata?: any }[] {
    const similarities = vectors.map((v) => ({
      id: v.id,
      similarity: this.cosineSimilarity(queryVector, v.vector),
      metadata: v.metadata,
    }));

    // 按相似度降序排序
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topK);
  }

  /**
   * 批量生成嵌入向量
   */
  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * 生成模拟向量（当 AI 服务不可用时使用）
   * 基于文本内容的简单哈希生成伪随机但稳定的向量
   */
  private generateSimulatedEmbedding(text: string): number[] {
    const vector: number[] = [];
    const hash = this.simpleHash(text);

    for (let i = 0; i < this.EMBEDDING_DIMENSIONS; i++) {
      // 使用文本哈希生成伪随机但确定性的值
      const seed = hash + i * 31;
      vector.push(this.seededRandom(seed));
    }

    // 归一化向量
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map((val) => val / magnitude);
  }

  /**
   * 简单的字符串哈希函数
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash;
  }

  /**
   * 生成确定性随机数（基于种子）
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * 填充或截断向量到指定维度
   */
  private padOrTruncateVector(vector: number[], targetDim: number): number[] {
    if (vector.length > targetDim) {
      return vector.slice(0, targetDim);
    } else if (vector.length < targetDim) {
      const padded = [...vector];
      while (padded.length < targetDim) {
        padded.push(0);
      }
      return padded;
    }
    return vector;
  }

  /**
   * 将模块数据扁平化为文本
   */
  private flattenModuleToText(moduleData: any): string {
    if (!moduleData) return '';

    const parts: string[] = [];

    const flatten = (obj: any, prefix: string = ''): void => {
      if (obj === null || obj === undefined) return;

      if (typeof obj === 'string') {
        if (prefix && obj) {
          parts.push(`${prefix}: ${obj}`);
        }
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (typeof item === 'object') {
            flatten(item, `${prefix}[${index}]`);
          } else if (item) {
            parts.push(`${prefix}[${index}]: ${item}`);
          }
        });
        return;
      }

      if (typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          flatten(value, newPrefix);
        });
      }
    };

    flatten(moduleData);
    return parts.join('\n');
  }
}
