/**
 * Pinecone 向量数据库提供者
 * 使用 @pinecone-database/pinecone 实现
 */

import { Injectable, Logger } from '@nestjs/common';
import { Pinecone, Index } from '@pinecone-database/pinecone';
import {
  IVectorProvider,
  Vector,
  VectorInsert,
  SearchOptions,
  SearchResult,
  IndexStatus,
  HealthStatus,
  VectorMetrics,
  Collection,
} from '../../interfaces/vector-provider.interface';
import { vectorDbConfig } from '../../config/vector-db.config';

@Injectable()
export class PineconeProvider implements IVectorProvider {
  readonly name = 'pinecone';
  private readonly logger = new Logger(PineconeProvider.name);
  private client: Pinecone | null = null;
  private index: Index | null = null;
  private initialized = false;
  private metrics = {
    queryCount: 0,
    insertCount: 0,
    totalQueryLatency: 0,
    totalInsertLatency: 0,
  };

  private get config() {
    return vectorDbConfig.pinecone;
  }

  private get vectorConfig() {
    return vectorDbConfig.vector;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.logger.log('初始化 Pinecone 连接');

      this.client = new Pinecone({
        apiKey: this.config.apiKey,
      });

      // 检查连接
      await this.client.describeIndex(this.config.indexName);

      // 获取索引
      this.index = this.client.Index(this.config.indexName);

      this.initialized = true;
      this.logger.log('Pinecone 连接初始化成功');
    } catch (error) {
      this.logger.error(`Pinecone 连接初始化失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getCollection(
    name: string,
    dimension: number = this.vectorConfig.dimension,
    metric: string = this.vectorConfig.metric,
  ): Promise<Collection> {
    this.ensureInitialized();

    try {
      const indexName = name || this.config.indexName;

      // 检查索引是否存在
      let indexDescription;
      try {
        indexDescription = await this.client!.describeIndex(indexName);
      } catch {
        // 索引不存在，创建新索引
        this.logger.log(`创建 Pinecone 索引: ${indexName}`);
        await this.client!.createIndex({
          name: indexName,
          dimension,
          metric: this.getPineconeMetric(metric),
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });

        // 等待索引准备就绪
        await this.waitForIndex(indexName);
        indexDescription = await this.client!.describeIndex(indexName);
      }

      // 更新当前索引引用
      this.index = this.client!.Index(indexName);

      return {
        name: indexDescription.name,
        dimension: indexDescription.dimension,
        vectorCount: 0, // Pinecone 不直接提供总数
        metric: indexDescription.metric || metric,
      };
    } catch (error) {
      this.logger.error(`获取 Pinecone 索引失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async insertVectors(collectionName: string, vectors: VectorInsert[]): Promise<void> {
    this.ensureInitialized();

    const startTime = Date.now();
    try {
      const index = this.index || this.client!.Index(collectionName);

      const records = vectors.map((v) => ({
        id: v.id,
        values: v.vector,
        metadata: v.metadata || {},
      }));

      await index.upsert(records);

      this.metrics.insertCount += vectors.length;
      this.metrics.totalInsertLatency += Date.now() - startTime;

      this.logger.debug(`插入 ${vectors.length} 个向量到 ${collectionName}`);
    } catch (error) {
      this.logger.error(`插入向量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async insertVectorsBatch(
    collectionName: string,
    vectors: VectorInsert[],
    batchSize: number = 100,
  ): Promise<void> {
    this.ensureInitialized();

    const index = this.index || this.client!.Index(collectionName);

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      const records = batch.map((v) => ({
        id: v.id,
        values: v.vector,
        metadata: v.metadata || {},
      }));

      await index.upsert(records);
      this.logger.debug(`批量插入进度: ${Math.min(i + batchSize, vectors.length)}/${vectors.length}`);
    }
  }

  async search(
    collectionName: string,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    this.ensureInitialized();

    const startTime = Date.now();
    try {
      const index = this.index || this.client!.Index(collectionName);

      const queryResponse = await index.query({
        vector: options.vector || [],
        topK: options.topK || 10,
        includeMetadata: options.includeMetadata !== false,
        filter: options.filter,
      });

      this.metrics.queryCount++;
      this.metrics.totalQueryLatency += Date.now() - startTime;

      return (queryResponse.matches || []).map((match) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as Record<string, any>,
      }));
    } catch (error) {
      this.logger.error(`搜索失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteVectors(collectionName: string, ids: string[]): Promise<void> {
    this.ensureInitialized();

    try {
      const index = this.index || this.client!.Index(collectionName);
      await index.deleteMany(ids);

      this.logger.debug(`从 ${collectionName} 删除 ${ids.length} 个向量`);
    } catch (error) {
      this.logger.error(`删除向量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getByIds(collectionName: string, ids: string[]): Promise<Vector[]> {
    this.ensureInitialized();

    try {
      const index = this.index || this.client!.Index(collectionName);
      const results = await index.fetch(ids);

      return Object.values(results.records).map((record) => ({
        id: record.id,
        vector: record.values,
        metadata: record.metadata,
      }));
    } catch (error) {
      this.logger.error(`获取向量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getIndexStatus(collectionName: string): Promise<IndexStatus> {
    this.ensureInitialized();

    try {
      const indexName = collectionName || this.config.indexName;
      const description = await this.client!.describeIndex(indexName);

      return {
        exists: true,
        vectorCount: 0, // Pinecone 不直接提供总数
        dimension: description.dimension,
        metric: description.metric || this.vectorConfig.metric,
      };
    } catch (error) {
      return {
        exists: false,
        vectorCount: 0,
        dimension: this.vectorConfig.dimension,
        metric: this.vectorConfig.metric,
      };
    }
  }

  async dropCollection(collectionName: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.client!.deleteIndex(collectionName);
      this.logger.log(`删除 Pinecone 索引: ${collectionName}`);
    } catch (error) {
      this.logger.error(`删除索引失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    try {
      this.ensureInitialized();

      const description = await this.client!.describeIndex(this.config.indexName);

      return {
        healthy: true,
        provider: this.name,
        latency: Date.now() - startTime,
        details: {
          indexName: description.name,
          dimension: description.dimension,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        provider: this.name,
        latency: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  async getMetrics(): Promise<VectorMetrics> {
    return {
      totalVectors: this.metrics.insertCount,
      totalCollections: 1,
      queryLatency: this.metrics.queryCount > 0 ? this.metrics.totalQueryLatency / this.metrics.queryCount : 0,
      insertLatency: this.metrics.insertCount > 0 ? this.metrics.totalInsertLatency / this.metrics.insertCount : 0,
      avgLatency: (this.metrics.totalQueryLatency + this.metrics.totalInsertLatency) / (this.metrics.queryCount + this.metrics.insertCount) || 0,
    };
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.index = null;
    this.initialized = false;
    this.logger.log('Pinecone 连接已关闭');
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.client) {
      throw new Error('Pinecone 提供者未初始化，请先调用 initialize()');
    }
  }

  private async waitForIndex(indexName: string, maxWaitTime: number = 60000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const description = await this.client!.describeIndex(indexName);
      if (description.status?.ready) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error(`等待索引 ${indexName} 准备就绪超时`);
  }

  private getPineconeMetric(metric: string): 'cosine' | 'euclidean' | 'dotproduct' {
    switch (metric.toUpperCase()) {
      case 'COSINE':
        return 'cosine';
      case 'IP':
        return 'dotproduct';
      case 'L2':
        return 'euclidean';
      default:
        return 'cosine';
    }
  }
}
