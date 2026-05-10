import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { ApiUsageLog } from '../entities/api-usage-log.entity';
export declare class ApiGatewayMiddleware implements NestMiddleware {
    private apiKeyRepository;
    private usageLogRepository;
    private readonly logger;
    constructor(apiKeyRepository: Repository<ApiKey>, usageLogRepository: Repository<ApiUsageLog>);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
    private validateApiKey;
    private validateSignature;
    private checkRateLimit;
    private logUsage;
}
export declare class ApiScopeGuard {
    private apiKeyRepository;
    constructor(apiKeyRepository: Repository<ApiKey>);
    canActivate(requiredScopes: string[]): boolean;
}
