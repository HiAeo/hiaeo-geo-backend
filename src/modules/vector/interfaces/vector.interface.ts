/**
 * 向量数据库接口定义
 */

/** 向量记录 */
export interface VectorRecord {
  id: string;
  values: number[];  // 向量 embedding
  metadata?: {
    brandId: string;
    type: string;
    title: string;
    content?: string;
    source?: string;
    url?: string;
    createdAt?: string;
    [key: string]: any;
  };
}

/** 向量搜索结果 */
export interface VectorSearchResult {
  id: string;
  score: number;  // 相似度分数
  metadata: Record<string, any>;
}

/** 向量搜索请求 */
export interface VectorSearchRequest {
  brandId?: string;
  namespace?: string;
  topK?: number;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
}

/** 向量 Upsert 请求 */
export interface VectorUpsertRequest {
  records: VectorRecord[];
  namespace?: string;
}

/** 向量删除请求 */
export interface VectorDeleteRequest {
  ids?: string[];
  deleteAll?: boolean;
  namespace?: string;
  filter?: Record<string, any>;
}

/** 嵌入请求 */
export interface EmbeddingRequest {
  texts: string[];
  model?: string;
}

/** 嵌入结果 */
export interface EmbeddingResult {
  embedding: number[];
  index: number;
}

/** Pinecone 索引描述 */
export interface IndexDescription {
  name: string;
  dimension: number;
  metric: string;
  pods: number;
  replicas: number;
  status: 'Ready' | 'Initializing' | 'Scaling';
}
