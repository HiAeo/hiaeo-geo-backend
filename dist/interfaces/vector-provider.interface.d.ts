export interface Vector {
    id: string;
    vector: number[];
    metadata?: Record<string, any>;
}
export interface VectorInsert {
    id: string;
    vector: number[];
    metadata?: Record<string, any>;
}
export interface SearchOptions {
    vector?: number[];
    queryText?: string;
    topK?: number;
    includeMetadata?: boolean;
    filter?: Record<string, any>;
}
export interface SearchResult {
    id: string;
    score: number;
    vector?: number[];
    metadata?: Record<string, any>;
}
export interface IndexStatus {
    exists: boolean;
    vectorCount: number;
    dimension: number;
    metric: string;
    indexType?: string;
}
export interface CollectionStats {
    name: string;
    vectorCount: number;
    dimension: number;
    totalMemory?: string;
    lastUpdated?: Date;
}
export interface HealthStatus {
    healthy: boolean;
    provider: string;
    latency?: number;
    error?: string;
    details?: Record<string, any>;
}
export interface VectorMetrics {
    totalVectors: number;
    totalCollections: number;
    queryLatency: number;
    insertLatency: number;
    avgLatency: number;
}
export interface IVectorProvider {
    readonly name: string;
    initialize(): Promise<void>;
    isInitialized(): boolean;
    getCollection(name: string, dimension?: number, metric?: string): Promise<Collection>;
    insertVectors(collectionName: string, vectors: VectorInsert[]): Promise<void>;
    insertVectorsBatch(collectionName: string, vectors: VectorInsert[], batchSize?: number): Promise<void>;
    search(collectionName: string, options: SearchOptions): Promise<SearchResult[]>;
    deleteVectors(collectionName: string, ids: string[]): Promise<void>;
    getByIds(collectionName: string, ids: string[]): Promise<Vector[]>;
    getIndexStatus(collectionName: string): Promise<IndexStatus>;
    dropCollection(collectionName: string): Promise<void>;
    checkHealth(): Promise<HealthStatus>;
    getMetrics(): Promise<VectorMetrics>;
    disconnect(): Promise<void>;
}
export interface Collection {
    name: string;
    dimension: number;
    vectorCount: number;
    metric: string;
}
