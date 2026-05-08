import { Repository } from 'typeorm';
import { ApiKey, ApiKeyStatus, ApiKeyScope } from '../entities/api-key.entity';
export declare class ApiKeyService {
    private apiKeyRepository;
    constructor(apiKeyRepository: Repository<ApiKey>);
    create(params: {
        organizationId: string;
        name: string;
        description?: string;
        scopes?: ApiKeyScope[];
        rateLimit?: number;
        monthlyLimit?: number;
        expiresAt?: Date;
        isProduction?: boolean;
        createdBy: string;
    }): Promise<{
        apiKey: ApiKey;
        secret: string;
    }>;
    validate(key: string, secret: string): Promise<ApiKey | null>;
    validateSignature(params: {
        key: string;
        timestamp: string;
        signature: string;
        body?: string;
    }): boolean;
    updateUsage(apiKeyId: string, ip: string): Promise<void>;
    checkRateLimit(apiKey: ApiKey): Promise<boolean>;
    findAll(organizationId: string): Promise<ApiKey[]>;
    findOne(id: string): Promise<ApiKey>;
    update(id: string, params: Partial<ApiKey>): Promise<ApiKey>;
    revoke(id: string): Promise<void>;
    toggleStatus(id: string, status: ApiKeyStatus): Promise<ApiKey>;
    remove(id: string): Promise<void>;
}
