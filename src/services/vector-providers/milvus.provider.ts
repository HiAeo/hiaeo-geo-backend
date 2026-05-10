/**
 * Milvus 向量数据库提供者
 * 使用 @zilliz/milvus2-sdk-node 实现
 */

import { Injectable, Logger } from '@nestjs/common';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { v4 as uuidv4 } from 'uuid';
import {
  IVectorProvider,
  Vector,
  VectorInsert,
  SearchOptions,
  SearchResult,
  IndexStatus,
  CollectionStats,
  HealthStatus,
  VectorMetrics,
  Collection,
} from '../../interfaces/vector-provider.interface';
import { vectorDbConfig } from '../../config/vector-db.config';

@Injectable()
export class MilvusProvider implements IVectorProvider {
  readonly name = 'milvus';
  private readonly logger = new Logger(MilvusProvider.name);
  private client: MilvusClient | null = null;
  private initialized = false;
  private metrics = {
    queryCount: 0,
    insertCount: 0,
    totalQueryLatency: 0,
    totalInsertLatency: 0,
  };

  private get config() {
    return vectorDbConfig.milvus;
  }

  private get vectorConfig() {
    return vectorDbConfig.vector;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.logger.log(`初始化 Milvus 连接: ${this.config.address}`);

      this.client = new MilvusClient({
        address: this.config.address,
        username: this.config.username || undefined,
        password: this.config.password || undefined,
        ssl: this.config.ssl,
        timeout: this.config.timeout,
      });

      // 测试连接
      await this.client.checkHealth();
      this.initialized = true;
      this.logger.log('Milvus 连接初始化成功');
    } catch (error) {
      this.logger.error(`Milvus 连接初始化失败: ${error.message}`, error.stack);
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
      const exists = await this.client!.hasCollection({ collection_name: name });

      if (!exists) {
        // 创建集合
        const metricType = this.getMilvusMetricType(metric);
        await this.client!.createCollection({
          collection_name: name,
          fields: [
            {
              name: 'id',
              data_type: 'VarChar',
              max_length: 64,
              is_primary_key: true,
            },
            {
              name: 'vector',
              data_type: 'FloatVector',
              dim: dimension,
            },
            {
              name: 'metadata',
              data_type: 'VarChar',
              max_length: 65535,
            },
          ],
        });

        // 创建索引
        await this.client!.createIndex({
          collection_name: name,
          field_name: 'vector',
          index_type: 'IVF_FLAT',
          metric_type: String(metricType),
          params: { nlist: 128 },
        });

        // 加载集合到内存
        await this.client!.loadCollectionSync({ collection_name: name });

        this.logger.log(`Milvus 集合创建成功: ${name}`);
      }

      // 获取集合统计
      const stats = await this.client!.getCollectionStatistics({
        collection_name: name,
      });

      return {
        name,
        dimension,
        vectorCount: parseInt(stats.data.total_vector_count || '0', 10),
        metric,
      };
    } catch (error) {
      this.logger.error(`获取 Milvus 集合失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async insertVectors(collectionName: string, vectors: VectorInsert[]): Promise<void> {
    this.ensureInitialized();

    const startTime = Date.now();
    try {
      await this.ensureCollectionExists(collectionName);

      const data = vectors.map((v) => ({
        id: v.id || uuidv4(),
        vector: v.vector,
        metadata: v.metadata ? JSON.stringify(v.metadata) : '',
      }));

      await this.client!.insert({
        collection_name: collectionName,
        fields_data: data,
      });

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
    batchSize: number = 1000,
  ): Promise<void> {
    this.ensureInitialized();

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.insertVectors(collectionName, batch);
    }
  }

  async search(
    collectionName: string,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    this.ensureInitialized();

    const startTime = Date.now();
    try {
      await this.ensureCollectionExists(collectionName);

      const searchParams = {
        collection_name: collectionName,
        vector_field_name: 'vector',
        top_k: options.topK || 10,
        vectors: [options.vector || []],
        output_fields: ['id', 'metadata'],
      };

      const results = await this.client!.search(searchParams);

      this.metrics.queryCount++;
      this.metrics.totalQueryLatency += Date.now() - startTime;

      return (results.results || []).map((hit: any) => ({
        id: hit.id,
        score: hit.score,
        metadata: hit.metadata ? JSON.parse(hit.metadata) : undefined,
      }));
    } catch (error) {
      this.logger.error(`搜索失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteVectors(collectionName: string, ids: string[]): Promise<void> {
    this.ensureInitialized();

    try {
      await this.client!.deleteEntities({
        collection_name: collectionName,
        expr: `id in [${ids.map((id) => `"${id}"`).join(',')}]`,
      });

      this.logger.debug(`从 ${collectionName} 删除 ${ids.length} 个向量`);
    } catch (error) {
      this.logger.error(`删除向量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getByIds(collectionName: string, ids: string[]): Promise<Vector[]> {
    this.ensureInitialized();

    try {
      const results = await this.client!.query({
        collection_name: collectionName,
        output_fields: ['id', 'vector', 'metadata'],
        filter: `id in [${ids.map((id) => `"${id}"`).join(',')}]`,
      });

      return (results.data || []).map((item: any) => ({
        id: item.id,
        vector: item.vector,
        metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      }));
    } catch (error) {
      this.logger.error(`获取向量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getIndexStatus(collectionName: string): Promise<IndexStatus> {
    this.ensureInitialized();

    try {
      const exists = await this.client!.hasCollection({ collection_name: collectionName });

      if (!exists) {
        return {
          exists: false,
          vectorCount: 0,
          dimension: this.vectorConfig.dimension,
          metric: this.vectorConfig.metric,
        };
      }

      const stats = await this.client!.getCollectionStatistics({
        collection_name: collectionName,
      });

      const describe = await this.client!.describeCollection({
        collection_name: collectionName,
      });

      // 获取字段信息
      const fields = describe.schema?.fields || [];

      return {
        exists: true,
        vectorCount: parseInt(stats.data.total_vector_count || '0', 10),
        dimension: this.vectorConfig.dimension,
        metric: this.vectorConfig.metric,
        indexType: undefined,
      };
    } catch (error) {
      this.logger.error(`获取索引状态失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async dropCollection(collectionName: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.client!.dropCollection({ collection_name: collectionName });
      this.logger.log(`删除 Milvus 集合: ${collectionName}`);
    } catch (error) {
      this.logger.error(`删除集合失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    try {
      this.ensureInitialized();

      const health = await this.client!.checkHealth();

      return {
        healthy: health.isHealthy || false,
        provider: this.name,
        latency: Date.now() - startTime,
        details: {
          isHealthy: health.isHealthy,
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
      totalCollections: 0, // 需要单独查询
      queryLatency: this.metrics.queryCount > 0 ? this.metrics.totalQueryLatency / this.metrics.queryCount : 0,
      insertLatency: this.metrics.insertCount > 0 ? this.metrics.totalInsertLatency / this.metrics.insertCount : 0,
      avgLatency: (this.metrics.totalQueryLatency + this.metrics.totalInsertLatency) / (this.metrics.queryCount + this.metrics.insertCount) || 0,
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.closeConnection();
      this.client = null;
      this.initialized = false;
      this.logger.log('Milvus 连接已关闭');
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.client) {
      throw new Error('Milvus 提供者未初始化，请先调用 initialize()');
    }
  }

  private async ensureCollectionExists(name: string): Promise<void> {
    const exists = await this.client!.hasCollection({ collection_name: name });
    if (!exists) {
      await this.getCollection(name);
    }
  }

  private getMilvusMetricType(metric: string): number {
    switch (metric.toUpperCase()) {
      case 'COSINE':
        return 1; // COSINE
      case 'IP':
        return 2; // IP (Inner Product)
      case 'L2':
        return 0; // L2 (Euclidean)
      default:
        return 1;
    }
  }
}
