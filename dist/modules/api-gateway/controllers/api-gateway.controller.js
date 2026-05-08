"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../user/guards/permission.guard");
const require_permission_decorator_1 = require("../../user/decorators/require-permission.decorator");
const api_key_service_1 = require("../services/api-key.service");
let ApiGatewayController = class ApiGatewayController {
    constructor(apiKeyService) {
        this.apiKeyService = apiKeyService;
    }
    async findAll(req) {
        return this.apiKeyService.findAll(req.user.organizationId);
    }
    async findOne(id) {
        return this.apiKeyService.findOne(id);
    }
    async create(dto, req) {
        const result = await this.apiKeyService.create({
            ...dto,
            organizationId: req.user.organizationId,
            createdBy: req.user.userId,
        });
        return {
            ...result.apiKey,
            secret: result.secret,
        };
    }
    async update(id, dto) {
        return this.apiKeyService.update(id, dto);
    }
    async suspend(id) {
        return this.apiKeyService.toggleStatus(id, 'suspended');
    }
    async activate(id) {
        return this.apiKeyService.toggleStatus(id, 'active');
    }
    async regenerateSecret(id) {
        const apiKey = await this.apiKeyService.findOne(id);
        return {
            message: 'Secret已重新生成',
            secret: 'new_secret_would_be_here',
        };
    }
    async revoke(id, req) {
        await this.apiKeyService.revoke(id);
        return { message: 'API Key已吊销' };
    }
    async remove(id) {
        await this.apiKeyService.remove(id);
        return { message: 'API Key已删除' };
    }
    async getUsageStats(req, days = 30) {
        return {
            totalCalls: 0,
            successRate: 0,
            avgResponseTime: 0,
            topEndpoints: [],
        };
    }
};
exports.ApiGatewayController = ApiGatewayController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('user:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/suspend'),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "suspend", null);
__decorate([
    (0, common_1.Put)(':id/activate'),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-secret'),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "regenerateSecret", null);
__decorate([
    (0, common_1.Post)(':id/revoke'),
    (0, require_permission_decorator_1.RequirePermission)('user:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "revoke", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('user:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/usage'),
    (0, require_permission_decorator_1.RequirePermission)('audit:read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getUsageStats", null);
exports.ApiGatewayController = ApiGatewayController = __decorate([
    (0, common_1.Controller)('api-keys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [api_key_service_1.ApiKeyService])
], ApiGatewayController);
//# sourceMappingURL=api-gateway.controller.js.map