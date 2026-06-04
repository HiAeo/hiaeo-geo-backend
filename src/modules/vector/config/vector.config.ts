/**
 * Pinecone 向量数据库配置
 */

// 从环境变量读取配置
export const PINECONE_CONFIG = {
  apiKey: process.env.PINECONE_API_KEY || '',
  environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
  indexName: process.env.PINECONE_INDEX_NAME || 'brand-knowledge',
  
  // 向量配置
  dimension: 1536, // OpenAI text-embedding-ada-002 输出维度
  metric: 'cosine' as const,
  
  // 服务器配置
  podType: 'starter',
  pods: 1,
};

// 向量命名空间配置
export const VECTOR_NAMESPACES = {
  KNOWLEDGE: 'knowledge',       // 品牌知识库
  DIAGNOSIS: 'diagnosis',      // 诊断报告
  STRATEGY: 'strategy',        // 策略文档
  CONTENT: 'content',          // 内容库
} as const;

// 向量元数据字段
export const VECTOR_METADATA_FIELDS = {
  brandId: 'brandId',
  type: 'type',
  title: 'title',
  content: 'content',
  source: 'source',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const;
