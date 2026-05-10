export declare const vectorDbConfig: {
    readonly provider: string;
    readonly milvus: {
        readonly address: string;
        readonly dbName: string;
        readonly collectionName: string;
        readonly username: string;
        readonly password: string;
        readonly ssl: boolean;
        readonly timeout: number;
    };
    readonly pinecone: {
        readonly apiKey: string;
        readonly environment: string;
        readonly indexName: string;
        readonly projectId: string;
    };
    readonly qdrant: {
        readonly url: string;
        readonly collectionName: string;
        readonly apiKey: string;
    };
    readonly vector: {
        readonly dimension: number;
        readonly metric: "COSINE" | "IP" | "L2";
    };
    readonly pool: {
        readonly maxConnections: number;
        readonly connectionTimeout: number;
    };
    readonly fallback: {
        readonly enabled: boolean;
        readonly retryAttempts: number;
        readonly retryDelay: number;
    };
};
export type VectorDbProvider = 'milvus' | 'pinecone' | 'qdrant' | 'memory';
export type VectorMetric = 'COSINE' | 'IP' | 'L2';
