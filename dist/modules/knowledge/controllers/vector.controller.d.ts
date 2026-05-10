import { VectorHealthService } from '../../../services/vector-health.service';
import { VectorStorageService } from '../services/vector-storage.service';
export declare class VectorController {
    private readonly healthService;
    private readonly storageService;
    constructor(healthService: VectorHealthService, storageService: VectorStorageService);
    checkHealth(): Promise<import("../../../interfaces").HealthStatus>;
    getMetrics(): Promise<import("../../../interfaces").VectorMetrics>;
    getStats(collection?: string): Promise<import("../../../interfaces").CollectionStats>;
    getConfig(): Record<string, any>;
    getStorageStats(): Promise<{
        totalOrganizations: number;
        memoryUsage: string;
        provider: string;
        vectorDbStats?: {
            totalVectors: number;
            totalCollections: number;
        };
    }>;
    rebuildCollection(body: {
        organizationIds?: string[];
    }): Promise<{
        success: number;
        failed: string[];
    } | {
        message: string;
    }>;
    checkAllCollections(collections?: string): Promise<{
        healthy: boolean;
        collections: import("../../../interfaces").CollectionStats[];
        errors: string[];
    }>;
}
