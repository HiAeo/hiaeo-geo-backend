export declare enum ApiKeyStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    EXPIRED = "expired",
    REVOKED = "revoked"
}
export declare enum ApiKeyScope {
    DIAGNOSIS = "diagnosis",
    CONTENT_GENERATE = "content:generate",
    STRATEGY_GENERATE = "strategy:generate",
    SEMANTIC_QUERY = "semantic:query",
    ALL = "all"
}
export declare class ApiKey {
    id: string;
    organizationId: string;
    name: string;
    key: string;
    secret: string;
    description: string;
    scopes: ApiKeyScope[];
    status: ApiKeyStatus;
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
    isExpired(): boolean;
    isValid(): boolean;
    hasScope(scope: ApiKeyScope): boolean;
}
