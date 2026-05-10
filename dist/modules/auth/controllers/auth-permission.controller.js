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
exports.AuthPermissionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const permission_guard_1 = require("../guards/permission.guard");
const permission_decorator_1 = require("../decorators/permission.decorator");
const role_service_1 = require("../services/role.service");
const permission_service_1 = require("../services/permission.service");
const user_role_service_1 = require("../services/user-role.service");
const role_dto_1 = require("../dto/role.dto");
const permissions_constant_1 = require("../constants/permissions.constant");
let AuthPermissionController = class AuthPermissionController {
    constructor(roleService, permissionService, userRoleService) {
        this.roleService = roleService;
        this.permissionService = permissionService;
        this.userRoleService = userRoleService;
    }
    async createRole(dto) {
        const role = await this.roleService.createRole(dto);
        return { success: true, data: role };
    }
    async getRoles(includeInactive) {
        const roles = await this.roleService.getRoles(includeInactive === 'true');
        return { data: roles };
    }
    async getRoleById(id) {
        const role = await this.roleService.getRoleById(id);
        return { data: role };
    }
    async updateRole(id, dto) {
        const role = await this.roleService.updateRole(id, dto);
        return { success: true, data: role };
    }
    async deleteRole(id) {
        await this.roleService.deleteRole(id);
        return { success: true, message: '角色已删除' };
    }
    async getAllPermissions() {
        const permissions = await this.permissionService.getAllPermissions();
        return { data: permissions };
    }
    async getUserPermissions(userId) {
        const permissions = await this.permissionService.getUserPermissions(userId);
        const roles = await this.permissionService.getUserRoles(userId);
        return { data: { permissions, roles } };
    }
    async getMyPermissions(req) {
        const permissions = await this.permissionService.getUserPermissions(req.user.id);
        const roles = await this.permissionService.getUserRoles(req.user.id);
        return { data: { permissions, roles } };
    }
    async assignRole(userId, dto, req) {
        const userRole = await this.userRoleService.assignRole(userId, dto, req.user.id);
        return { success: true, data: userRole };
    }
    async revokeRole(userId, roleId) {
        await this.userRoleService.revokeRole(userId, roleId);
        return { success: true, message: '角色已撤销' };
    }
    async getUserRoles(userId) {
        const roles = await this.userRoleService.getUserRoles(userId);
        return { data: roles };
    }
    async setKnowledgeScope(userId, dto) {
        const userRole = await this.userRoleService.setKnowledgeScope(userId, dto);
        return { success: true, data: userRole };
    }
    async checkPermission(dto, req) {
        const hasPermission = await this.permissionService.checkPermission(req.user.id, dto.permission, dto.resourceId);
        return { data: { hasPermission } };
    }
};
exports.AuthPermissionController = AuthPermissionController;
__decorate([
    (0, common_1.Post)('roles'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.ROLE_MANAGE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "createRole", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.ROLE_MANAGE),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('roles/:id'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.ROLE_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "getRoleById", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.ROLE_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.ROLE_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "getAllPermissions", null);
__decorate([
    (0, common_1.Get)('user/:userId/permissions'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.USER_MANAGE),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Get)('my-permissions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "getMyPermissions", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.USER_MANAGE),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, role_dto_1.AssignRoleDto, Object]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.USER_MANAGE),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('roleId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "revokeRole", null);
__decorate([
    (0, common_1.Get)('users/:userId/roles'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.USER_MANAGE),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Put)('users/:userId/roles/scope'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.USER_MANAGE),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, role_dto_1.SetKnowledgeScopeDto]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "setKnowledgeScope", null);
__decorate([
    (0, common_1.Post)('check-permission'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_dto_1.CheckPermissionDto, Object]),
    __metadata("design:returntype", Promise)
], AuthPermissionController.prototype, "checkPermission", null);
exports.AuthPermissionController = AuthPermissionController = __decorate([
    (0, common_1.Controller)('v1/auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [role_service_1.RoleService,
        permission_service_1.PermissionService,
        user_role_service_1.UserRoleService])
], AuthPermissionController);
//# sourceMappingURL=auth-permission.controller.js.map