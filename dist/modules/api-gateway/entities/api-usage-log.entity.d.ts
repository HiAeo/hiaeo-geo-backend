export declare class ApiUsageLog {
    id: string;
    apiKeyId: string;
    organizationId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    requestSize: number;
    responseSize: number;
    ip: string;
    userAgent: string;
    requestBody: Record<string, any>;
    responseBody: Record<string, any>;
    errorMessage: string;
    createdAt: Date;
    isSuccess(): boolean;
}
