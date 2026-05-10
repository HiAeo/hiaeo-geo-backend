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
var PermissionGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permission_service_1 = require("../services/permission.service");
const permission_decorator_1 = require("../decorators/permission.decorator");
let PermissionGuard = PermissionGuard_1 = class PermissionGuard {
    constructor(reflector, permissionService) {
        this.reflector = reflector;
        this.permissionService = permissionService;
        this.logger = new common_1.Logger(PermissionGuard_1.name);
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(permission_decorator_1.PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        const requireKnowledgeAccess = this.reflector.getAllAndOverride(permission_decorator_1.KNOWLEDGE_ACCESS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('用户未认证');
        }
        const userId = user.id;
        const resourceId = request.params.knowledgeId ||
            request.params.id ||
            request.body?.knowledgeId ||
            request.query?.knowledgeId;
        if (requireKnowledgeAccess) {
            if (!resourceId) {
                throw new common_1.ForbiddenException('缺少知识库ID参数');
            }
            const hasAccess = await this.permissionService.checkKnowledgeAccess(userId, resourceId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('无权访问该知识库');
            }
        }
        for (const permission of requiredPermissions) {
            const hasPermission = await this.permissionService.checkPermission(userId, permission, resourceId);
            if (!hasPermission) {
                this.logger.warn(`用户 ${userId} 缺少权限: ${permission}`);
                throw new common_1.ForbiddenException(`缺少必需权限: ${permission}`);
            }
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = PermissionGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permission_service_1.PermissionService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map