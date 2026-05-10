/**
 * 内存向量数据库提供者（回退方案）
 * 用于开发和测试，或当其他向量数据库不可用时
 */

import { Injectable, Logger } from '@nestjs/common';
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

interface InMemoryVector {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

@Injectable()
export class InMemoryProvider implements IVectorProvider {
  readonly name = 'memory';
  private readonly logger = new Logger(InMemoryProvider.name);
  private collections: Map<string, Map<string, InMemoryVector>> = new Map();
  private initialized = false;
  private metrics = {
    queryCount: 0,
    insertCount: 0,
    totalQueryLatency: 0,
    totalInsertLatency: 0,
  };

  private get vectorConfig() {
    return vectorDbConfig.vector;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.logger.log('内存向量提供者初始化成功');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getCollection(
    name: string,
    dimension: number = this.vectorConfig.dimension,
    _metric: string = this.vectorConfig.metric,
  ): Promise<Collection> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }

    const vectors = this.collections.get(name)!;
    let totalDimension = dimension;

    // 如果集合中有向量，使用第一个向量的维度
    if (vectors.size > 0) {
      const firstVector = vectors.values().next().value;
      totalDimension = firstVector.vector.length;
    }

    return {
      name,
      dimension: totalDimension,
      vectorCount: vectors.size,
      metric: this.vectorConfig.metric,
    };
  }

  async insertVectors(collectionName: string, vectors: VectorInsert[]): Promise<void> {
    const startTime = Date.now();

    let collection = this.collections.get(collectionName);
    if (!collection) {
      collection = new Map();
      this.collections.set(collectionName, collection);
    }

    for (const v of vectors) {
      collection.set(v.id, {
        id: v.id,
        vector: v.vector,
        metadata: v.metadata,
      });
    }

    this.metrics.insertCount += vectors.length;
    this.metrics.totalInsertLatency += Date.now() - startTime;

    this.logger.debug(`插入 ${vectors.length} 个向量到内存集合 ${collectionName}`);
  }

  async insertVectorsBatch(
    collectionName: string,
    vectors: VectorInsert[],
    _batchSize: number = 1000,
  ): Promise<void> {
    await this.insertVectors(collectionName, vectors);
  }

  async search(
    collectionName: string,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    const startTime = Date.now();

    const collection = this.collections.get(collectionName);
    if (!collection || collection.size === 0) {
      return [];
    }

    const queryVector = options.vector;
    if (!queryVector) {
      return [];
    }

    const topK = options.topK || 10;

    // 计算所有向量的相似度
    const results: SearchResult[] = [];

    for (const [id, data] of collection.entries()) {
      // 如果有过滤条件
      if (options.filter) {
        const metadata = data.metadata || {};
        const matches = Object.entries(options.filter).every(
          ([key, value]) => metadata[key] === value,
        );
        if (!matches) continue;
      }

      const score = this.cosineSimilarity(queryVector, data.vector);

      results.push({
        id,
        score,
        metadata: data.metadata,
      });
    }

    // 按相似度降序排序
    results.sort((a, b) => b.score - a.score);

    this.metrics.queryCount++;
    this.metrics.totalQueryLatency += Date.now() - startTime;

    return results.slice(0, topK);
  }

  async deleteVectors(collectionName: string, ids: string[]): Promise<void> {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      return;
    }

    for (const id of ids) {
      collection.delete(id);
    }

    this.logger.debug(`从内存集合 ${collectionName} 删除 ${ids.length} 个向量`);
  }

  async getByIds(collectionName: string, ids: string[]): Promise<Vector[]> {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      return [];
    }

    const vectors: Vector[] = [];
    for (const id of ids) {
      const data = collection.get(id);
      if (data) {
        vectors.push({
          id: data.id,
          vector: data.vector,
          metadata: data.metadata,
        });
      }
    }

    return vectors;
  }

  async getIndexStatus(collectionName: string): Promise<IndexStatus> {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      return {
        exists: false,
        vectorCount: 0,
        dimension: this.vectorConfig.dimension,
        metric: this.vectorConfig.metric,
      };
    }

    let dimension = this.vectorConfig.dimension;
    if (collection.size > 0) {
      const firstVector = collection.values().next().value;
      dimension = firstVector.vector.length;
    }

    return {
      exists: true,
      vectorCount: collection.size,
      dimension,
      metric: this.vectorConfig.metric,
    };
  }

  async dropCollection(collectionName: string): Promise<void> {
    this.collections.delete(collectionName);
    this.logger.log(`删除内存集合: ${collectionName}`);
  }

  async checkHealth(): Promise<HealthStatus> {
    return {
      healthy: true,
      provider: this.name,
      details: {
        totalCollections: this.collections.size,
        totalVectors: Array.from(this.collections.values()).reduce(
          (sum, col) => sum + col.size,
          0,
        ),
      },
    };
  }

  async getMetrics(): Promise<VectorMetrics> {
    const totalVectors = Array.from(this.collections.values()).reduce(
      (sum, col) => sum + col.size,
      0,
    );

    return {
      totalVectors,
      totalCollections: this.collections.size,
      queryLatency: this.metrics.queryCount > 0 ? this.metrics.totalQueryLatency / this.metrics.queryCount : 0,
      insertLatency: this.metrics.insertCount > 0 ? this.metrics.totalInsertLatency / this.metrics.insertCount : 0,
      avgLatency: (this.metrics.totalQueryLatency + this.metrics.totalInsertLatency) / (this.metrics.queryCount + this.metrics.insertCount) || 0,
    };
  }

  async disconnect(): Promise<void> {
    this.collections.clear();
    this.initialized = false;
    this.logger.log('内存向量提供者已清理');
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
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
   * 清空所有数据（测试用）
   */
  clearAll(): void {
    this.collections.clear();
    this.logger.log('清空所有内存向量数据');
  }

  /**
   * 获取集合中的所有向量（测试用）
   */
  getAllVectors(collectionName: string): Vector[] {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      return [];
    }

    return Array.from(collection.values()).map((v) => ({
      id: v.id,
      vector: v.vector,
      metadata: v.metadata,
    }));
  }
}
