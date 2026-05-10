/**
 * 向量数据类型
 */
export interface Vector {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

/**
 * 向量插入数据
 */
export interface VectorInsert {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  vector?: number[];
  queryText?: string;
  topK?: number;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  id: string;
  score: number;
  vector?: number[];
  metadata?: Record<string, any>;
}

/**
 * 索引状态
 */
export interface IndexStatus {
  exists: boolean;
  vectorCount: number;
  dimension: number;
  metric: string;
  indexType?: string;
}

/**
 * 集合统计
 */
export interface CollectionStats {
  name: string;
  vectorCount: number;
  dimension: number;
  totalMemory?: string;
  lastUpdated?: Date;
}

/**
 * 健康状态
 */
export interface HealthStatus {
  healthy: boolean;
  provider: string;
  latency?: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * 性能指标
 */
export interface VectorMetrics {
  totalVectors: number;
  totalCollections: number;
  queryLatency: number;
  insertLatency: number;
  avgLatency: number;
}

/**
 * IVectorProvider 接口
 * 定义向量数据库提供者的标准方法
 */
export interface IVectorProvider {
  /**
   * 提供者名称
   */
  readonly name: string;

  /**
   * 初始化连接
   */
  initialize(): Promise<void>;

  /**
   * 检查连接是否已初始化
   */
  isInitialized(): boolean;

  /**
   * 创建或获取集合
   * @param name 集合名称
   * @param dimension 向量维度
   * @param metric 距离度量
   */
  getCollection(
    name: string,
    dimension?: number,
    metric?: string,
  ): Promise<Collection>;

  /**
   * 插入向量
   * @param collectionName 集合名称
   * @param vectors 向量数据
   */
  insertVectors(collectionName: string, vectors: VectorInsert[]): Promise<void>;

  /**
   * 批量插入向量
   * @param collectionName 集合名称
   * @param vectors 向量数据
   */
  insertVectorsBatch(
    collectionName: string,
    vectors: VectorInsert[],
    batchSize?: number,
  ): Promise<void>;

  /**
   * 搜索
   * @param collectionName 集合名称
   * @param options 搜索选项
   */
  search(
    collectionName: string,
    options: SearchOptions,
  ): Promise<SearchResult[]>;

  /**
   * 删除向量
   * @param collectionName 集合名称
   * @param ids 向量 IDs
   */
  deleteVectors(collectionName: string, ids: string[]): Promise<void>;

  /**
   * 根据 IDs 获取向量
   * @param collectionName 集合名称
   * @param ids 向量 IDs
   */
  getByIds(collectionName: string, ids: string[]): Promise<Vector[]>;

  /**
   * 获取集合状态
   * @param collectionName 集合名称
   */
  getIndexStatus(collectionName: string): Promise<IndexStatus>;

  /**
   * 删除集合
   * @param collectionName 集合名称
   */
  dropCollection(collectionName: string): Promise<void>;

  /**
   * 检查健康状态
   */
  checkHealth(): Promise<HealthStatus>;

  /**
   * 获取性能指标
   */
  getMetrics(): Promise<VectorMetrics>;

  /**
   * 释放连接
   */
  disconnect(): Promise<void>;
}

/**
 * 集合信息
 */
export interface Collection {
  name: string;
  dimension: number;
  vectorCount: number;
  metric: string;
}
