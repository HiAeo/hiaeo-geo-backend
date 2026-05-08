import { ApiKeyService } from '../services/api-key.service';
import { ApiKeyScope } from '../entities/api-key.entity';
export declare class ApiGatewayController {
    private apiKeyService;
    constructor(apiKeyService: ApiKeyService);
    findAll(req: any): Promise<import("../entities/api-key.entity").ApiKey[]>;
    findOne(id: string): Promise<import("../entities/api-key.entity").ApiKey>;
    create(dto: {
        name: string;
        description?: string;
        scopes?: ApiKeyScope[];
        rateLimit?: number;
        monthlyLimit?: number;
        expiresAt?: Date;
        isProduction?: boolean;
    }, req: any): Promise<{
        secret: string;
        id: string;
        organizationId: string;
        name: string;
        key: string;
        description: string;
        scopes: ApiKeyScope[];
        status: import("../entities/api-key.entity").ApiKeyStatus;
        rateLimit: number;
        monthlyLimit: number;
        usedCount: number;
        expiresAt: Date;
        lastUsedAt: Date;
        lastUsedIp: string;
        isProduction: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    update(id: string, dto: Partial<{
        name: string;
        description: string;
        scopes: ApiKeyScope[];
        rateLimit: number;
        monthlyLimit: number;
        expiresAt: Date;
    }>): Promise<import("../entities/api-key.entity").ApiKey>;
    suspend(id: string): Promise<import("../entities/api-key.entity").ApiKey>;
    activate(id: string): Promise<import("../entities/api-key.entity").ApiKey>;
    regenerateSecret(id: string): Promise<{
        message: string;
        secret: string;
    }>;
    revoke(id: string, req: any): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getUsageStats(req: any, days?: number): Promise<{
        totalCalls: number;
        successRate: number;
        avgResponseTime: number;
        topEndpoints: never[];
    }>;
}
