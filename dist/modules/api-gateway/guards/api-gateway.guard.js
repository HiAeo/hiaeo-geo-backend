"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ApiGatewayMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiScopeGuard = exports.ApiGatewayMiddleware = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const api_key_entity_1 = require("../entities/api-key.entity");
const api_usage_log_entity_1 = require("../entities/api-usage-log.entity");
let ApiGatewayMiddleware = ApiGatewayMiddleware_1 = class ApiGatewayMiddleware {
    constructor(apiKeyRepository, usageLogRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.usageLogRepository = usageLogRepository;
        this.logger = new common_1.Logger(ApiGatewayMiddleware_1.name);
    }
    async use(req, res, next) {
        if (!req.path.startsWith('/api/')) {
            return next();
        }
        const apiKey = req.headers['x-api-key'] || req.query['api_key'];
        const apiSecret = req.headers['x-api-secret'] || req.query['api_secret'];
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];
        if (!apiKey) {
            return next();
        }
        try {
            const keyRecord = await this.validateApiKey(apiKey);
            if (!keyRecord) {
                throw new common_1.HttpException('无效的API Key', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (signature && timestamp) {
                const isValidSignature = this.validateSignature(keyRecord, req, timestamp, signature);
                if (!isValidSignature) {
                    throw new common_1.HttpException('签名验证失败', common_1.HttpStatus.UNAUTHORIZED);
                }
            }
            await this.checkRateLimit(keyRecord, req);
            await this.logUsage(keyRecord, req);
            req.apiKey = keyRecord;
            next();
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error(`API验证失败: ${error.message}`, error.stack);
            throw new common_1.HttpException('API验证失败', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async validateApiKey(key) {
        const apiKey = await this.apiKeyRepository.findOne({
            where: { key },
            relations: ['organization'],
        });
        if (!apiKey) {
            return null;
        }
        if (apiKey.status !== api_key_entity_1.ApiKeyStatus.ACTIVE) {
            throw new common_1.HttpException(`API Key已被${apiKey.status === api_key_entity_1.ApiKeyStatus.REVOKED ? '吊销' : '暂停'}`, common_1.HttpStatus.FORBIDDEN);
        }
        if (apiKey.isExpired()) {
            apiKey.status = api_key_entity_1.ApiKeyStatus.EXPIRED;
            await this.apiKeyRepository.save(apiKey);
            throw new common_1.HttpException('API Key已过期', common_1.HttpStatus.FORBIDDEN);
        }
        return apiKey;
    }
    validateSignature(apiKey, req, timestamp, signature) {
        const now = Date.now();
        const ts = parseInt(timestamp, 10);
        if (isNaN(ts) || Math.abs(now - ts) > 5 * 60 * 1000) {
            return false;
        }
        const method = req.method.toUpperCase();
        const path = req.path;
        const body = req.body ? JSON.stringify(req.body) : '';
        const stringToSign = `${method}${path}${timestamp}${body}`;
        const expectedSignature = crypto
            .createHmac('sha256', apiKey.secret)
            .update(stringToSign)
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    async checkRateLimit(apiKey, req) {
        const now = new Date();
        const startOfMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const requestCount = await this.usageLogRepository.count({
            where: {
                apiKeyId: apiKey.id,
                createdAt: (0, typeorm_2.MoreThan)(startOfMinute),
            },
        });
        if (apiKey.rateLimit > 0 && requestCount >= apiKey.rateLimit) {
            throw new common_1.HttpException('请求过于频繁，请稍后再试', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    async logUsage(apiKey, req) {
        const log = this.usageLogRepository.create({
            apiKeyId: apiKey.id,
            organizationId: apiKey.organizationId,
            endpoint: req.path,
            method: req.method,
            statusCode: 200,
            ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
        });
        await this.usageLogRepository.save(log);
    }
};
exports.ApiGatewayMiddleware = ApiGatewayMiddleware;
exports.ApiGatewayMiddleware = ApiGatewayMiddleware = ApiGatewayMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __param(1, (0, typeorm_1.InjectRepository)(api_usage_log_entity_1.ApiUsageLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ApiGatewayMiddleware);
let ApiScopeGuard = class ApiScopeGuard {
    constructor(apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }
    canActivate(requiredScopes) {
        return true;
    }
};
exports.ApiScopeGuard = ApiScopeGuard;
exports.ApiScopeGuard = ApiScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApiScopeGuard);
//# sourceMappingURL=api-gateway.guard.js.map