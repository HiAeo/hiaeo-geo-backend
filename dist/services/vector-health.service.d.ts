import { HealthStatus, VectorMetrics, CollectionStats } from '../interfaces/vector-provider.interface';
export declare class VectorHealthService {
    private readonly logger;
    checkHealth(): Promise<HealthStatus>;
    getMetrics(): Promise<VectorMetrics>;
    getCollectionStats(collectionName: string): Promise<CollectionStats>;
    checkAllCollections(collectionNames: string[]): Promise<{
        healthy: boolean;
        collections: CollectionStats[];
        errors: string[];
    }>;
}
