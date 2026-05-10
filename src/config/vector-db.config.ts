/**
 * 向量数据库配置
 * 支持 Milvus、Pinecone 和 Qdrant
 */
export const vectorDbConfig = {
  // 向量数据库提供者: 'milvus' | 'pinecone' | 'qdrant' | 'memory'
  provider: process.env.VECTOR_DB_PROVIDER || 'memory',

  // Milvus 配置
  milvus: {
    address: process.env.MILVUS_ADDRESS || 'localhost:19530',
    dbName: process.env.MILVUS_DB || 'knowledge_base',
    collectionName: process.env.MILVUS_COLLECTION || 'brand_knowledge_embeddings',
    username: process.env.MILVUS_USER || '',
    password: process.env.MILVUS_PASSWORD || '',
    ssl: process.env.MILVUS_SSL === 'true',
    timeout: parseInt(process.env.MILVUS_TIMEOUT || '30000', 10),
  },

  // Pinecone 配置
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENV || 'us-east-1',
    indexName: process.env.PINECONE_INDEX || 'brand-knowledge',
    projectId: process.env.PINECONE_PROJECT_ID || '',
  },

  // Qdrant 配置
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    collectionName: process.env.QDRANT_COLLECTION || 'brand_knowledge',
    apiKey: process.env.QDRANT_API_KEY || '',
  },

  // 向量参数
  vector: {
    dimension: parseInt(process.env.VECTOR_DIMENSION || '1536', 10),
    metric: (process.env.VECTOR_METRIC || 'COSINE') as 'COSINE' | 'IP' | 'L2',
  },

  // 连接池配置
  pool: {
    maxConnections: parseInt(process.env.VECTOR_POOL_MAX || '10', 10),
    connectionTimeout: parseInt(process.env.VECTOR_CONNECTION_TIMEOUT || '5000', 10),
  },

  // 回退配置
  fallback: {
    enabled: process.env.VECTOR_FALLBACK_ENABLED !== 'false',
    retryAttempts: parseInt(process.env.VECTOR_FALLBACK_RETRY || '3', 10),
    retryDelay: parseInt(process.env.VECTOR_FALLBACK_DELAY || '1000', 10),
  },
} as const;

export type VectorDbProvider = 'milvus' | 'pinecone' | 'qdrant' | 'memory';
export type VectorMetric = 'COSINE' | 'IP' | 'L2';
