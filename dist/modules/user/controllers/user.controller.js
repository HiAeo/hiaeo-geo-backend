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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../guards/permission.guard");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
const user_service_1 = require("../services/user.service");
const organization_service_1 = require("../services/organization.service");
const audit_service_1 = require("../services/audit.service");
const dto_1 = require("../dto");
const organization_dto_1 = require("../dto/organization.dto");
const query_dto_1 = require("../dto/query.dto");
let UserController = class UserController {
    constructor(userService, organizationService, auditService) {
        this.userService = userService;
        this.organizationService = organizationService;
        this.auditService = auditService;
    }
    async findAll(query, req) {
        const { organizationId } = req.user;
        return this.userService.findAll(query, organizationId);
    }
    async findOne(id) {
        return this.userService.findOne(id);
    }
    async create(dto, req) {
        const { organizationId, userId } = req.user;
        await this.organizationService.updateUserCount(organizationId, 1);
        const user = await this.userService.create(dto, organizationId, userId);
        await this.auditService.log({
            organizationId,
            userId,
            userName: req.user.name,
            action: 'create',
            resource: 'user',
            resourceId: user.id,
            details: { email: user.email, role: dto.roleCode },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return user;
    }
    async update(id, dto, req) {
        const { organizationId, userId, name } = req.user;
        const before = await this.userService.findOne(id);
        const user = await this.userService.update(id, dto, userId);
        await this.auditService.log({
            organizationId,
            userId,
            userName: name,
            action: 'update',
            resource: 'user',
            resourceId: id,
            before: { name: before.name, roleId: before.roleId },
            after: { name: user.name, roleId: user.roleId },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return user;
    }
    async updatePassword(id, dto, req) {
        await this.userService.updatePassword(id, dto);
        await this.auditService.log({
            organizationId: req.user.organizationId,
            userId: req.user.userId,
            userName: req.user.name,
            action: 'update_password',
            resource: 'user',
            resourceId: id,
            details: { isSensitive: true },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return { message: '密码已更新' };
    }
    async resetPassword(id, dto, req) {
        await this.userService.resetPassword({ ...dto, userId: id });
        await this.auditService.log({
            organizationId: req.user.organizationId,
            userId: req.user.userId,
            userName: req.user.name,
            action: 'reset_password',
            resource: 'user',
            resourceId: id,
            details: { isSensitive: true },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return { message: '密码已重置' };
    }
    async toggleStatus(id, status, req) {
        const user = await this.userService.toggleStatus(id, status);
        await this.auditService.log({
            organizationId: req.user.organizationId,
            userId: req.user.userId,
            userName: req.user.name,
            action: 'toggle_status',
            resource: 'user',
            resourceId: id,
            details: { status },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return user;
    }
    async remove(id, req) {
        await this.userService.remove(id);
        await this.auditService.log({
            organizationId: req.user.organizationId,
            userId: req.user.userId,
            userName: req.user.name,
            action: 'delete',
            resource: 'user',
            resourceId: id,
            details: { isSensitive: true },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return { message: '用户已删除' };
    }
    async getOrganization(req) {
        return this.organizationService.findOne(req.user.organizationId);
    }
    async updateOrganization(dto, req) {
        const org = await this.organizationService.update(req.user.organizationId, dto);
        await this.auditService.log({
            organizationId: req.user.organizationId,
            userId: req.user.userId,
            userName: req.user.name,
            action: 'update',
            resource: 'organization',
            resourceId: req.user.organizationId,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return org;
    }
    async getAuditLogs(query, req) {
        const logsQuery = { ...query, organizationId: req.user.organizationId };
        return this.auditService.findAll(logsQuery);
    }
    async getUserHistory(userId, req) {
        return this.auditService.getUserHistory(userId);
    }
    async getAuditStats(days, req) {
        return this.auditService.getSensitiveStats(req.user.organizationId, days || 30);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.QueryUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/password'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Put)(':id/reset-password'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ResetPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('user:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('organization/profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getOrganization", null);
__decorate([
    (0, common_1.Put)('organization/profile'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('org:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [organization_dto_1.UpdateOrganizationDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateOrganization", null);
__decorate([
    (0, common_1.Get)('audit/logs'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('audit:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.QueryAuditLogDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('audit/user-history/:userId'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('audit:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserHistory", null);
__decorate([
    (0, common_1.Get)('audit/stats'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)('audit:read'),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAuditStats", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService,
        organization_service_1.OrganizationService,
        audit_service_1.AuditService])
], UserController);
//# sourceMappingURL=user.controller.js.map