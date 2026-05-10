"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorDbConfig = void 0;
exports.vectorDbConfig = {
    provider: process.env.VECTOR_DB_PROVIDER || 'memory',
    milvus: {
        address: process.env.MILVUS_ADDRESS || 'localhost:19530',
        dbName: process.env.MILVUS_DB || 'knowledge_base',
        collectionName: process.env.MILVUS_COLLECTION || 'brand_knowledge_embeddings',
        username: process.env.MILVUS_USER || '',
        password: process.env.MILVUS_PASSWORD || '',
        ssl: process.env.MILVUS_SSL === 'true',
        timeout: parseInt(process.env.MILVUS_TIMEOUT || '30000', 10),
    },
    pinecone: {
        apiKey: process.env.PINECONE_API_KEY || '',
        environment: process.env.PINECONE_ENV || 'us-east-1',
        indexName: process.env.PINECONE_INDEX || 'brand-knowledge',
        projectId: process.env.PINECONE_PROJECT_ID || '',
    },
    qdrant: {
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        collectionName: process.env.QDRANT_COLLECTION || 'brand_knowledge',
        apiKey: process.env.QDRANT_API_KEY || '',
    },
    vector: {
        dimension: parseInt(process.env.VECTOR_DIMENSION || '1536', 10),
        metric: (process.env.VECTOR_METRIC || 'COSINE'),
    },
    pool: {
        maxConnections: parseInt(process.env.VECTOR_POOL_MAX || '10', 10),
        connectionTimeout: parseInt(process.env.VECTOR_CONNECTION_TIMEOUT || '5000', 10),
    },
    fallback: {
        enabled: process.env.VECTOR_FALLBACK_ENABLED !== 'false',
        retryAttempts: parseInt(process.env.VECTOR_FALLBACK_RETRY || '3', 10),
        retryDelay: parseInt(process.env.VECTOR_FALLBACK_DELAY || '1000', 10),
    },
};
//# sourceMappingURL=vector-db.config.js.map