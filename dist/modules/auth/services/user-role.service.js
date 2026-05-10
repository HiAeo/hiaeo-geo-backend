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
var UserRoleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_role_entity_1 = require("../entities/user-role.entity");
const role_entity_1 = require("../entities/role.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let UserRoleService = UserRoleService_1 = class UserRoleService {
    constructor(userRoleRepository, roleRepository, userRepository) {
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(UserRoleService_1.name);
    }
    async assignRole(userId, dto, grantedBy) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const role = await this.roleRepository.findOne({
            where: { id: dto.roleId, isActive: true },
        });
        if (!role) {
            throw new common_1.NotFoundException('角色不存在或已停用');
        }
        const existing = await this.userRoleRepository.findOne({
            where: { userId, roleId: dto.roleId },
        });
        if (existing) {
            throw new common_1.BadRequestException('用户已拥有该角色');
        }
        const userRole = this.userRoleRepository.create({
            userId,
            roleId: dto.roleId,
            knowledgeScope: dto.knowledgeScope || [],
            expiresAt: dto.expiresAt,
            grantedBy,
        });
        const savedUserRole = await this.userRoleRepository.save(userRole);
        this.logger.log(`角色 ${role.name} 已分配给用户 ${userId}`);
        return savedUserRole;
    }
    async revokeRole(userId, roleId) {
        const userRole = await this.userRoleRepository.findOne({
            where: { userId, roleId },
        });
        if (!userRole) {
            throw new common_1.NotFoundException('用户没有该角色');
        }
        await this.userRoleRepository.remove(userRole);
        this.logger.log(`角色 ${roleId} 已从用户 ${userId} 撤销`);
    }
    async getUserRoles(userId) {
        return this.userRoleRepository.find({
            where: { userId },
            relations: ['role'],
            order: { createdAt: 'DESC' },
        });
    }
    async setKnowledgeScope(userId, dto) {
        const userRole = await this.userRoleRepository.findOne({
            where: { userId, roleId: dto.roleId },
        });
        if (!userRole) {
            throw new common_1.NotFoundException('用户没有该角色');
        }
        userRole.knowledgeScope = dto.knowledgeIds;
        const updated = await this.userRoleRepository.save(userRole);
        this.logger.log(`用户 ${userId} 的角色 ${dto.roleId} 知识库范围已更新`);
        return updated;
    }
    async batchAssignRoles(userId, roleIds, knowledgeScope, grantedBy) {
        const results = [];
        for (const roleId of roleIds) {
            try {
                const dto = {
                    roleId,
                    knowledgeScope,
                };
                const userRole = await this.assignRole(userId, dto, grantedBy);
                results.push(userRole);
            }
            catch (error) {
                if (error instanceof common_1.BadRequestException) {
                    this.logger.warn(`跳过已存在的角色: ${roleId}`);
                    continue;
                }
                throw error;
            }
        }
        return results;
    }
    async removeAllRoles(userId) {
        await this.userRoleRepository.delete({ userId });
        this.logger.log(`用户 ${userId} 的所有角色已移除`);
    }
    async hasRole(userId, roleName) {
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
            relations: ['role'],
        });
        const validRoles = userRoles.filter(ur => !ur.isExpired());
        return validRoles.some(ur => ur.role?.name === roleName);
    }
};
exports.UserRoleService = UserRoleService;
exports.UserRoleService = UserRoleService = UserRoleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.BrandRole)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserRoleService);
//# sourceMappingURL=user-role.service.js.map