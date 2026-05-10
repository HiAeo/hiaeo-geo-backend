import { Repository, DataSource } from 'typeorm';
import { ApiUsageLog } from '../entities/api-usage-log.entity';
import { ApiKey } from '../entities/api-key.entity';
export interface UsageStats {
    total: number;
    success: number;
    failed: number;
    successRate: number;
    avgResponseTime: number;
    byEndpoint: Record<string, number>;
    byDay: Array<{
        date: string;
        count: number;
    }>;
}
export interface ApiKeyUsageStats {
    apiKeyId: string;
    apiKeyName: string;
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    lastUsedAt: Date;
    remainingQuota: number;
    usagePercentage: number;
}
export declare class ApiStatsService {
    private usageLogRepository;
    private apiKeyRepository;
    private dataSource;
    private readonly logger;
    constructor(usageLogRepository: Repository<ApiUsageLog>, apiKeyRepository: Repository<ApiKey>, dataSource: DataSource);
    getUsageStats(apiKeyId: string, startDate: Date, endDate: Date): Promise<UsageStats>;
    getTopApiKeys(limit?: number): Promise<ApiKeyUsageStats[]>;
    getHealthStatus(): Promise<{
        overall: 'healthy' | 'degraded' | 'down';
        successRate: number;
        avgResponseTime: number;
        activeKeys: number;
        requestsLast24h: number;
    }>;
    cleanupOldLogs(daysToKeep?: number): Promise<number>;
}
