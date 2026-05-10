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
var RoleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
const permission_entity_1 = require("../entities/permission.entity");
const permissions_constant_1 = require("../constants/permissions.constant");
let RoleService = RoleService_1 = class RoleService {
    constructor(roleRepository, permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.logger = new common_1.Logger(RoleService_1.name);
    }
    async createRole(dto) {
        const existing = await this.roleRepository.findOne({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.BadRequestException(`角色 ${dto.name} 已存在`);
        }
        const role = this.roleRepository.create({
            name: dto.name,
            description: dto.description,
            permissions: dto.permissions || [],
            isSystem: dto.isSystem || false,
            level: dto.level || 0,
            isActive: true,
        });
        const savedRole = await this.roleRepository.save(role);
        this.logger.log(`角色 ${savedRole.name} 创建成功`);
        return savedRole;
    }
    async getRoles(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.roleRepository.find({
            where,
            order: { level: 'DESC', createdAt: 'ASC' },
        });
    }
    async getRoleById(id) {
        const role = await this.roleRepository.findOne({
            where: { id },
        });
        if (!role) {
            throw new common_1.NotFoundException(`角色不存在`);
        }
        return role;
    }
    async getRoleByName(name) {
        return this.roleRepository.findOne({ where: { name } });
    }
    async updateRole(id, dto) {
        const role = await this.getRoleById(id);
        if (role.isSystem && dto.name && dto.name !== role.name) {
            throw new common_1.BadRequestException('系统内置角色不能修改名称');
        }
        if (dto.name !== undefined)
            role.name = dto.name;
        if (dto.description !== undefined)
            role.description = dto.description;
        if (dto.permissions !== undefined)
            role.permissions = dto.permissions;
        if (dto.isActive !== undefined)
            role.isActive = dto.isActive;
        if (dto.level !== undefined)
            role.level = dto.level;
        const updatedRole = await this.roleRepository.save(role);
        this.logger.log(`角色 ${updatedRole.name} 更新成功`);
        return updatedRole;
    }
    async deleteRole(id) {
        const role = await this.getRoleById(id);
        if (role.isSystem) {
            throw new common_1.BadRequestException('系统内置角色不能删除');
        }
        await this.roleRepository.remove(role);
        this.logger.log(`角色 ${role.name} 删除成功`);
    }
    async initDefaultRoles() {
        const existingRoles = await this.roleRepository.find({
            where: { isSystem: true },
        });
        if (existingRoles.length > 0) {
            this.logger.log('系统角色已存在，跳过初始化');
            return;
        }
        this.logger.log('开始初始化系统角色...');
        const permissionList = [
            { code: permissions_constant_1.PERMISSIONS.KNOWLEDGE_READ, name: '查看知识库', module: 'KNOWLEDGE', description: '查看知识库内容' },
            { code: permissions_constant_1.PERMISSIONS.KNOWLEDGE_WRITE, name: '编辑知识库', module: 'KNOWLEDGE', description: '创建和编辑知识库内容' },
            { code: permissions_constant_1.PERMISSIONS.KNOWLEDGE_DELETE, name: '删除知识库', module: 'KNOWLEDGE', description: '删除知识库' },
            { code: permissions_constant_1.PERMISSIONS.KNOWLEDGE_AUDIT, name: '审核知识库', module: 'KNOWLEDGE', description: '审核知识库变更' },
            { code: permissions_constant_1.PERMISSIONS.WORKFLOW_READ, name: '查看工作流', module: 'WORKFLOW', description: '查看工作流' },
            { code: permissions_constant_1.PERMISSIONS.WORKFLOW_WRITE, name: '编辑工作流', module: 'WORKFLOW', description: '创建和编辑工作流' },
            { code: permissions_constant_1.PERMISSIONS.WORKFLOW_EXECUTE, name: '执行工作流', module: 'WORKFLOW', description: '执行工作流' },
            { code: permissions_constant_1.PERMISSIONS.CONTENT_READ, name: '查看内容', module: 'CONTENT', description: '查看内容' },
            { code: permissions_constant_1.PERMISSIONS.CONTENT_WRITE, name: '编辑内容', module: 'CONTENT', description: '创建和编辑内容' },
            { code: permissions_constant_1.PERMISSIONS.USER_MANAGE, name: '用户管理', module: 'USER', description: '管理系统用户' },
            { code: permissions_constant_1.PERMISSIONS.ROLE_MANAGE, name: '角色管理', module: 'ROLE', description: '管理角色和权限' },
            { code: permissions_constant_1.PERMISSIONS.AUDIT_VIEW, name: '查看审计日志', module: 'AUDIT', description: '查看审计日志' },
            { code: permissions_constant_1.PERMISSIONS.BRAND_READ, name: '查看品牌', module: 'BRAND', description: '查看品牌信息' },
            { code: permissions_constant_1.PERMISSIONS.BRAND_WRITE, name: '编辑品牌', module: 'BRAND', description: '编辑品牌信息' },
            { code: permissions_constant_1.PERMISSIONS.STRATEGY_READ, name: '查看策略', module: 'STRATEGY', description: '查看推广策略' },
            { code: permissions_constant_1.PERMISSIONS.STRATEGY_WRITE, name: '编辑策略', module: 'STRATEGY', description: '编辑推广策略' },
            { code: permissions_constant_1.PERMISSIONS.PUBLISH_READ, name: '查看发布', module: 'PUBLISH', description: '查看发布内容' },
            { code: permissions_constant_1.PERMISSIONS.PUBLISH_EXECUTE, name: '执行发布', module: 'PUBLISH', description: '执行发布操作' },
        ];
        for (const permData of permissionList) {
            const existing = await this.permissionRepository.findOne({
                where: { code: permData.code },
            });
            if (!existing) {
                const permission = this.permissionRepository.create(permData);
                await this.permissionRepository.save(permission);
            }
        }
        const roleConfigs = [
            {
                name: permissions_constant_1.SYSTEM_ROLES.ADMIN,
                description: '管理员 - 拥有系统全部权限',
                permissions: permissions_constant_1.DEFAULT_ROLE_PERMISSIONS[permissions_constant_1.SYSTEM_ROLES.ADMIN],
                level: 100,
            },
            {
                name: permissions_constant_1.SYSTEM_ROLES.EDITOR,
                description: '编辑 - 可以查看和编辑知识库和内容',
                permissions: permissions_constant_1.DEFAULT_ROLE_PERMISSIONS[permissions_constant_1.SYSTEM_ROLES.EDITOR],
                level: 50,
            },
            {
                name: permissions_constant_1.SYSTEM_ROLES.VIEWER,
                description: '查看者 - 仅可查看知识库和内容',
                permissions: permissions_constant_1.DEFAULT_ROLE_PERMISSIONS[permissions_constant_1.SYSTEM_ROLES.VIEWER],
                level: 10,
            },
            {
                name: permissions_constant_1.SYSTEM_ROLES.GUEST,
                description: '访客 - 只读权限，受知识库范围限制',
                permissions: permissions_constant_1.DEFAULT_ROLE_PERMISSIONS[permissions_constant_1.SYSTEM_ROLES.GUEST],
                level: 1,
            },
        ];
        for (const config of roleConfigs) {
            const existing = await this.roleRepository.findOne({
                where: { name: config.name },
            });
            if (!existing) {
                const role = this.roleRepository.create({
                    ...config,
                    isSystem: true,
                    isActive: true,
                });
                await this.roleRepository.save(role);
                this.logger.log(`系统角色 ${config.name} 创建成功`);
            }
        }
        this.logger.log('系统角色初始化完成');
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = RoleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.BrandRole)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RoleService);
//# sourceMappingURL=role.service.js.map