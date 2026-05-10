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
var PermissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../entities/permission.entity");
const role_entity_1 = require("../entities/role.entity");
const user_role_entity_1 = require("../entities/user-role.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let PermissionService = PermissionService_1 = class PermissionService {
    constructor(permissionRepository, roleRepository, userRoleRepository, userRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(PermissionService_1.name);
    }
    async checkPermission(userId, permission, resourceId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role'],
        });
        if (!user) {
            return false;
        }
        if (user.role?.name === 'super_admin') {
            return true;
        }
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
            relations: ['role'],
        });
        const validRoles = userRoles.filter(ur => !ur.isExpired());
        for (const userRole of validRoles) {
            if (userRole.role?.hasPermission(permission)) {
                if (resourceId) {
                    if (userRole.canAccessKnowledge(resourceId)) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }
        return false;
    }
    async checkKnowledgeAccess(userId, knowledgeId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role'],
        });
        if (!user) {
            return false;
        }
        if (user.role?.name === 'super_admin') {
            return true;
        }
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
            relations: ['role'],
        });
        const validRoles = userRoles.filter(ur => !ur.isExpired());
        for (const userRole of validRoles) {
            if (userRole.role?.name === 'ADMIN') {
                return true;
            }
            if (userRole.canAccessKnowledge(knowledgeId)) {
                return true;
            }
        }
        return false;
    }
    async getUserPermissions(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role'],
        });
        if (!user) {
            return [];
        }
        if (user.role?.name === 'super_admin') {
            const allPermissions = await this.permissionRepository.find({
                where: { isActive: true },
            });
            return allPermissions.map(p => p.code);
        }
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
            relations: ['role'],
        });
        const validRoles = userRoles.filter(ur => !ur.isExpired());
        const permissionsSet = new Set();
        for (const userRole of validRoles) {
            if (userRole.role?.permissions) {
                userRole.role.permissions.forEach(p => permissionsSet.add(p));
            }
        }
        return Array.from(permissionsSet);
    }
    async getUserRoles(userId) {
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
            relations: ['role'],
        });
        const validRoles = userRoles.filter(ur => !ur.isExpired());
        return validRoles.map(ur => ur.role).filter(Boolean);
    }
    async getAllPermissions() {
        return this.permissionRepository.find({
            where: { isActive: true },
            order: { module: 'ASC', code: 'ASC' },
        });
    }
    async getPermissionsByModule(module) {
        return this.permissionRepository.find({
            where: { module, isActive: true },
            order: { code: 'ASC' },
        });
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = PermissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.BrandRole)),
    __param(2, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionService);
//# sourceMappingURL=permission.service.js.map