import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PINECONE_CONFIG,
  VECTOR_NAMESPACES,
} from '../config/vector.config';
import {
  VectorRecord,
  VectorSearchResult,
  VectorSearchRequest,
  VectorUpsertRequest,
  VectorDeleteRequest,
} from '../interfaces/vector.interface';
import { EmbeddingService } from './embedding.service';

/**
 * Pinecone 向量服务
 * 
 * 提供品牌知识的向量存储和检索功能
 */
@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private pinecone: any = null;
  private index: any = null;
  private initialized = false;

  constructor(
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {
    this.initializePinecone();
  }

  /**
   * 初始化 Pinecone 客户端
   */
  private async initializePinecone(): Promise<void> {
    try {
      // 检查是否有 API Key
      const apiKey = this.configService.get('PINECONE_API_KEY');
      if (!apiKey) {
        this.logger.warn('Pinecone API Key 未配置，向量功能将使用模拟模式');
        this.initialized = true;
        return;
      }

      // 动态导入 @pinecone-database/pinecone
      const { Pinecone } = await import('@pinecone-database/pinecone');
      
      this.pinecone = new Pinecone({
        apiKey,
        controllerHostUrl: this.configService.get('PINECONE_CONTROLLER_URL'),
      });

      // 获取索引
      const indexName = PINECONE_CONFIG.indexName;
      try {
        this.index = this.pinecone.Index(indexName);
        this.logger.log(`Pinecone 索引已连接: ${indexName}`);
      } catch (error) {
        this.logger.warn(`Pinecone 索引 ${indexName} 不存在，将使用模拟模式`);
      }

      this.initialized = true;
    } catch (error) {
      this.logger.error('Pinecone 初始化失败', error);
      this.initialized = true; // 标记已初始化，使用模拟模式
    }
  }

  /**
   * 检查是否可用
   */
  isAvailable(): boolean {
    return this.index !== null;
  }

  /**
   * Upsert 向量记录
   */
  async upsert(request: VectorUpsertRequest): Promise<{
    success: boolean;
    upsertedCount: number;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      // 模拟模式
      this.logger.log(`[模拟] Upsert ${request.records.length} 条记录`);
      return {
        success: true,
        upsertedCount: request.records.length,
      };
    }

    try {
      const namespace = request.namespace || '';
      await this.index.upsert(request.records, namespace);
      
      this.logger.log(`Upsert 完成: ${request.records.length} 条记录`);
      
      return {
        success: true,
        upsertedCount: request.records.length,
      };
    } catch (error) {
      this.logger.error('Upsert 失败', error);
      return {
        success: false,
        upsertedCount: 0,
        error: error.message,
      };
    }
  }

  /**
   * 搜索相似向量
   */
  async search(query: string, request: VectorSearchRequest): Promise<{
    success: boolean;
    results: VectorSearchResult[];
    error?: string;
  }> {
    try {
      // 1. 生成查询向量
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      if (!this.isAvailable()) {
        // 模拟模式：返回空结果
        this.logger.log(`[模拟] 搜索: "${query.substring(0, 50)}..."`);
        return {
          success: true,
          results: [],
        };
      }

      // 2. 执行搜索
      const searchRequest = {
        vector: queryEmbedding,
        topK: request.topK || 10,
        includeMetadata: request.includeMetadata !== false,
        filter: {
          ...(request.brandId && { brandId: { $eq: request.brandId } }),
          ...request.filter,
        },
      };

      const searchResponse = await this.index.query({
        ...searchRequest,
        ...(request.namespace && { namespace: request.namespace }),
      });

      // 3. 格式化结果
      const results: VectorSearchResult[] = (searchResponse.matches || []).map((match: any) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata || {},
      }));

      this.logger.log(`搜索完成: "${query.substring(0, 30)}..." -> ${results.length} 结果`);

      return {
        success: true,
        results,
      };
    } catch (error) {
      this.logger.error('搜索失败', error);
      return {
        success: false,
        results: [],
        error: error.message,
      };
    }
  }

  /**
   * 删除向量
   */
  async delete(request: VectorDeleteRequest): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      this.logger.log(`[模拟] 删除向量`);
      return { success: true };
    }

    try {
      if (request.ids && request.ids.length > 0) {
        await this.index.deleteMany(request.ids, request.namespace);
      } else if (request.deleteAll) {
        await this.index.deleteAll(request.namespace);
      } else if (request.filter) {
        await this.index.deleteMany(request.filter, request.namespace);
      }

      this.logger.log('向量删除完成');
      return { success: true };
    } catch (error) {
      this.logger.error('删除失败', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取向量统计
   */
  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
    namespaces: string[];
  }> {
    if (!this.isAvailable()) {
      return {
        totalVectors: 0,
        dimension: PINECONE_CONFIG.dimension,
        namespaces: Object.values(VECTOR_NAMESPACES),
      };
    }

    try {
      const stats = await this.index.describeIndexStats();
      
      return {
        totalVectors: stats.totalRecordCount || 0,
        dimension: stats.dimension || PINECONE_CONFIG.dimension,
        namespaces: Object.keys(stats.namespaces || {}),
      };
    } catch (error) {
      this.logger.error('获取统计失败', error);
      return {
        totalVectors: 0,
        dimension: PINECONE_CONFIG.dimension,
        namespaces: [],
      };
    }
  }

  /**
   * 存储品牌知识
   */
  async storeBrandKnowledge(params: {
    brandId: string;
    title: string;
    content: string;
    source?: string;
    type?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // 1. 生成 embedding
      const embedding = await this.embeddingService.generateEmbedding(params.content);
      
      // 2. 创建向量记录
      const id = `kb_${params.brandId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const record: VectorRecord = {
        id,
        values: embedding,
        metadata: {
          brandId: params.brandId,
          type: params.type || 'knowledge',
          title: params.title,
          content: params.content.substring(0, 10000), // Pinecone 限制
          source: params.source,
          createdAt: new Date().toISOString(),
        },
      };

      // 3. 存储
      const result = await this.upsert({
        records: [record],
        namespace: VECTOR_NAMESPACES.KNOWLEDGE,
      });

      return {
        success: result.success,
        id: result.success ? id : undefined,
        error: result.error,
      };
    } catch (error) {
      this.logger.error('存储品牌知识失败', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * RAG 检索
   */
  async ragRetrieve(query: string, brandId: string, topK: number = 5): Promise<{
    success: boolean;
    context: string;
    sources: { title: string; score: number }[];
    error?: string;
  }> {
    try {
      const searchResult = await this.search(query, {
        brandId,
        namespace: VECTOR_NAMESPACES.KNOWLEDGE,
        topK,
        includeMetadata: true,
      });

      if (!searchResult.success) {
        return {
          success: false,
          context: '',
          sources: [],
          error: searchResult.error,
        };
      }

      // 构建上下文
      const contextParts = searchResult.results
        .filter(r => r.metadata?.content)
        .map(r => `[来源: ${r.metadata.title}]\n${r.metadata.content}`)
        .join('\n\n');

      const sources = searchResult.results
        .filter(r => r.metadata?.title)
        .map(r => ({
          title: r.metadata.title,
          score: r.score,
        }));

      return {
        success: true,
        context: contextParts || '',
        sources,
      };
    } catch (error) {
      this.logger.error('RAG 检索失败', error);
      return {
        success: false,
        context: '',
        sources: [],
        error: error.message,
      };
    }
  }

  /**
   * 删除品牌所有向量
   */
  async deleteBrandVectors(brandId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.delete({
      filter: { brandId: { $eq: brandId } },
    });
  }
}
