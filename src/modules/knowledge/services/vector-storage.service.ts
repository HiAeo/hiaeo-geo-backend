import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { EmbeddingService } from './embedding.service';
import { IVectorProvider, VectorInsert, SearchResult } from '../../../interfaces/vector-provider.interface';
import { VectorDbFactory } from '../../../services/vector-db-factory.service';
import { vectorDbConfig } from '../../../config/vector-db.config';

/**
 * 向量存储服务
 * 负责知识库向量的生成、存储和检索
 * 支持 Milvus、Pinecone 和内存存储
 */
@Injectable()
export class VectorStorageService implements OnModuleInit {
  private readonly logger = new Logger(VectorStorageService.name);
  private provider: IVectorProvider;
  private collectionName: string;
  private initialized = false;

  // 向量存储结构（仅在内存模式使用）
  private memoryStore: Map<string, {
    organizationId: string;
    embedding: number[];
    sections: { name: string; vector: number[]; text: string }[];
    updatedAt: Date;
  }> = new Map();

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
    private embeddingService: EmbeddingService,
  ) {
    this.provider = VectorDbFactory.createProvider();
    this.collectionName = this.getCollectionName();
  }

  /**
   * 模块初始化时初始化向量提供者
   */
  async onModuleInit(): Promise<void> {
    await this.initializeProvider();
  }

  /**
   * 初始化向量提供者
   */
  private async initializeProvider(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.provider.initialize();
      await this.provider.getCollection(this.collectionName);
      this.initialized = true;
      this.logger.log(`向量存储服务初始化成功，提供者: ${this.provider.name}`);
    } catch (error) {
      this.logger.error(`向量提供者初始化失败: ${error.message}`);

      // 如果配置了回退，尝试使用内存存储
      if (vectorDbConfig.fallback.enabled) {
        this.logger.warn('启用内存存储作为回退方案');
        this.provider = VectorDbFactory.createProvider('memory');
        await this.provider.initialize();
        await this.provider.getCollection(this.collectionName);
        this.initialized = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * 获取集合名称
   */
  private getCollectionName(): string {
    const provider = vectorDbConfig.provider;
    switch (provider) {
      case 'milvus':
        return vectorDbConfig.milvus.collectionName;
      case 'pinecone':
        return vectorDbConfig.pinecone.indexName;
      case 'qdrant':
        return vectorDbConfig.qdrant.collectionName;
      default:
        return 'brand_knowledge_embeddings';
    }
  }

  /**
   * 初始化或更新组织的向量索引
   */
  async indexKnowledgeBase(organizationId: string): Promise<{
    status: 'created' | 'updated';
    sections: string[];
  }> {
    await this.ensureInitialized();

    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      throw new Error('知识库不存在');
    }

    // 生成向量
    const { embedding, sections } = await this.embeddingService.generateKnowledgeBaseEmbedding({
      basicInfo: knowledge.basicInfo,
      bizPositioning: knowledge.bizPositioning,
      productService: knowledge.productService,
      competitorMarket: knowledge.competitorMarket,
      geoGoals: knowledge.geoGoals,
      supplement: knowledge.supplement,
    });

    // 存储向量到向量数据库
    const storeKey = `org:${organizationId}`;
    const existing = this.memoryStore.get(storeKey);

    // 准备向量数据
    const vectors: VectorInsert[] = [
      {
        id: `${storeKey}:main`,
        vector: embedding,
        metadata: { organizationId, type: 'main', section: 'all' },
      },
      ...sections.map((s, index) => ({
        id: `${storeKey}:section:${index}`,
        vector: s.vector,
        metadata: { organizationId, type: 'section', section: s.name, text: this.getSectionText(knowledge, s.name) },
      })),
    ];

    // 插入向量
    await this.provider.insertVectors(this.collectionName, vectors);

    // 同时更新内存存储以保持兼容性
    this.memoryStore.set(storeKey, {
      organizationId,
      embedding,
      sections: sections.map((s) => ({
        ...s,
        text: this.getSectionText(knowledge, s.name),
      })),
      updatedAt: new Date(),
    });

    this.logger.log(`知识库向量索引已${existing ? '更新' : '创建'} - org: ${organizationId}`);

    return {
      status: existing ? 'updated' : 'created',
      sections: sections.map((s) => s.name),
    };
  }

  /**
   * 语义搜索
   */
  async semanticSearch(
    organizationId: string,
    query: string,
    topK: number = 5,
  ): Promise<{
    results: {
      section: string;
      similarity: number;
      text: string;
    }[];
  }> {
    await this.ensureInitialized();

    const storeKey = `org:${organizationId}`;
    const stored = this.memoryStore.get(storeKey);

    if (!stored) {
      // 尝试重新索引
      await this.indexKnowledgeBase(organizationId);
      return this.semanticSearch(organizationId, query, topK);
    }

    // 生成查询向量
    const queryVector = await this.embeddingService.generateEmbedding(query);

    // 优先使用向量数据库搜索
    if (this.provider.name !== 'memory') {
      try {
        const searchResults = await this.provider.search(this.collectionName, {
          vector: queryVector,
          topK: topK,
          filter: { organizationId },
          includeMetadata: true,
        });

        const results = searchResults
          .filter((r: any) => r.metadata && r.metadata.section)
          .map((r: any) => ({
            section: r.metadata?.section || 'unknown',
            similarity: r.score,
            text: r.metadata?.text || '',
          }));

        if (results.length > 0) {
          return { results };
        }
      } catch (error) {
        this.logger.warn(`向量数据库搜索失败，使用内存搜索: ${error.message}`);
      }
    }

    // 内存搜索作为回退
    const results = stored.sections.map((section) => ({
      section: section.name,
      similarity: this.embeddingService.cosineSimilarity(queryVector, section.vector),
      text: section.text,
    }));

    // 按相似度排序
    results.sort((a, b) => b.similarity - a.similarity);

    return {
      results: results.slice(0, topK),
    };
  }

  /**
   * 查找相似知识库
   */
  async findSimilarKnowledgeBases(
    organizationId: string,
    topK: number = 5,
  ): Promise<{
    similar: {
      organizationId: string;
      similarity: number;
    }[];
  }> {
    await this.ensureInitialized();

    const storeKey = `org:${organizationId}`;
    const targetStore = this.memoryStore.get(storeKey);

    if (!targetStore) {
      throw new Error('请先索引目标组织的知识库');
    }

    const similarities: { organizationId: string; similarity: number }[] = [];

    // 遍历所有存储的向量
    for (const [key, store] of this.memoryStore.entries()) {
      if (key === storeKey) continue;

      const similarity = this.embeddingService.cosineSimilarity(
        targetStore.embedding,
        store.embedding,
      );

      similarities.push({
        organizationId: store.organizationId,
        similarity,
      });
    }

    // 按相似度排序
    similarities.sort((a, b) => b.similarity - a.similarity);

    return {
      similar: similarities.slice(0, topK),
    };
  }

  /**
   * 删除组织的向量索引
   */
  async deleteIndex(organizationId: string): Promise<boolean> {
    await this.ensureInitialized();

    const storeKey = `org:${organizationId}`;

    // 从内存存储删除
    const deleted = this.memoryStore.delete(storeKey);

    // 从向量数据库删除
    if (this.provider.name !== 'memory') {
      try {
        // 获取该组织相关的所有向量 ID
        const allIds: string[] = [`${storeKey}:main`];
        const stored = this.memoryStore.get(storeKey);
        if (stored) {
          for (let i = 0; i < stored.sections.length; i++) {
            allIds.push(`${storeKey}:section:${i}`);
          }
        }
        await this.provider.deleteVectors(this.collectionName, allIds);
      } catch (error) {
        this.logger.warn(`从向量数据库删除失败: ${error.message}`);
      }
    }

    if (deleted) {
      this.logger.log(`知识库向量索引已删除 - org: ${organizationId}`);
    }

    return deleted;
  }

  /**
   * 获取索引状态
   */
  async getIndexStatus(organizationId: string): Promise<{
    indexed: boolean;
    sections: string[];
    updatedAt?: Date;
  }> {
    await this.ensureInitialized();

    const storeKey = `org:${organizationId}`;
    const stored = this.memoryStore.get(storeKey);

    if (!stored) {
      return { indexed: false, sections: [] };
    }

    return {
      indexed: true,
      sections: stored.sections.map((s) => s.name),
      updatedAt: stored.updatedAt,
    };
  }

  /**
   * 批量索引
   */
  async batchIndex(organizationIds: string[]): Promise<{
    success: number;
    failed: string[];
  }> {
    const failed: string[] = [];
    let success = 0;

    for (const orgId of organizationIds) {
      try {
        await this.indexKnowledgeBase(orgId);
        success++;
      } catch (error) {
        this.logger.error(`索引失败 - org: ${orgId}, error: ${error.message}`);
        failed.push(orgId);
      }
    }

    return { success, failed };
  }

  /**
   * 获取存储统计
   */
  async getStorageStats(): Promise<{
    totalOrganizations: number;
    memoryUsage: string;
    provider: string;
    vectorDbStats?: {
      totalVectors: number;
      totalCollections: number;
    };
  }> {
    await this.ensureInitialized();

    let totalVectors = 0;
    let totalDimensions = 0;

    for (const store of this.memoryStore.values()) {
      totalVectors += 1 + store.sections.length;
      totalDimensions += store.embedding.length + store.sections.reduce((sum, s) => sum + s.vector.length, 0);
    }

    // 估算内存使用（假设 float64 = 8 bytes）
    const memoryBytes = totalDimensions * 8;
    const memoryUsage = memoryBytes > 1024 * 1024
      ? `${(memoryBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(memoryBytes / 1024).toFixed(2)} KB`;

    const result: {
      totalOrganizations: number;
      memoryUsage: string;
      provider: string;
      vectorDbStats?: {
        totalVectors: number;
        totalCollections: number;
      };
    } = {
      totalOrganizations: this.memoryStore.size,
      memoryUsage,
      provider: this.provider.name,
    };

    // 获取向量数据库统计
    if (this.provider.name !== 'memory') {
      try {
        const metrics = await this.provider.getMetrics();
        result.vectorDbStats = {
          totalVectors: metrics.totalVectors,
          totalCollections: metrics.totalCollections,
        };
      } catch (error) {
        this.logger.warn(`获取向量数据库统计失败: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * 确保提供者已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeProvider();
    }
  }

  /**
   * 获取模块文本内容
   */
  private getSectionText(knowledge: BrandKnowledgeBase, sectionName: string): string {
    const sectionMap: Record<string, any> = {
      '企业基础信息': knowledge.basicInfo,
      '核心业务与定位': knowledge.bizPositioning,
      '产品与服务详情': knowledge.productService,
      '竞品与市场信息': knowledge.competitorMarket,
      'GEO推广目标': knowledge.geoGoals,
      '补充信息': knowledge.supplement,
    };

    const data = sectionMap[sectionName];
    if (!data) return '';

    return this.flattenToText(data);
  }

  /**
   * 扁平化为文本
   */
  private flattenToText(obj: any, prefix: string = ''): string {
    if (!obj) return '';

    const parts: string[] = [];

    const flatten = (value: any, key: string): void => {
      if (value === null || value === undefined) return;

      if (typeof value === 'string' && value) {
        parts.push(`${key}: ${value}`);
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            flatten(item, `${key}[${index}]`);
          } else if (item) {
            parts.push(`${key}[${index}]: ${item}`);
          }
        });
        return;
      }

      if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          const newKey = prefix ? `${prefix}.${k}` : k;
          flatten(v, newKey);
        });
      }
    };

    Object.entries(obj).forEach(([key, value]) => {
      flatten(value, key);
    });

    return parts.join('\n');
  }
}
