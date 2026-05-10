import { IVectorProvider, Vector, VectorInsert, SearchOptions, SearchResult, IndexStatus, HealthStatus, VectorMetrics, Collection } from '../../interfaces/vector-provider.interface';
export declare class InMemoryProvider implements IVectorProvider {
    readonly name = "memory";
    private readonly logger;
    private collections;
    private initialized;
    private metrics;
    private get vectorConfig();
    initialize(): Promise<void>;
    isInitialized(): boolean;
    getCollection(name: string, dimension?: number, _metric?: string): Promise<Collection>;
    insertVectors(collectionName: string, vectors: VectorInsert[]): Promise<void>;
    insertVectorsBatch(collectionName: string, vectors: VectorInsert[], _batchSize?: number): Promise<void>;
    search(collectionName: string, options: SearchOptions): Promise<SearchResult[]>;
    deleteVectors(collectionName: string, ids: string[]): Promise<void>;
    getByIds(collectionName: string, ids: string[]): Promise<Vector[]>;
    getIndexStatus(collectionName: string): Promise<IndexStatus>;
    dropCollection(collectionName: string): Promise<void>;
    checkHealth(): Promise<HealthStatus>;
    getMetrics(): Promise<VectorMetrics>;
    disconnect(): Promise<void>;
    private cosineSimilarity;
    clearAll(): void;
    getAllVectors(collectionName: string): Vector[];
}
