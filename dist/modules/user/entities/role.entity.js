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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.RolePermissions = exports.RoleType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var RoleType;
(function (RoleType) {
    RoleType["SUPER_ADMIN"] = "super_admin";
    RoleType["ORG_ADMIN"] = "org_admin";
    RoleType["BRAND_ADMIN"] = "brand_admin";
    RoleType["EDITOR"] = "editor";
    RoleType["VIEWER"] = "viewer";
})(RoleType || (exports.RoleType = RoleType = {}));
exports.RolePermissions = {
    [RoleType.SUPER_ADMIN]: [
        'user:create', 'user:read', 'user:update', 'user:delete',
        'org:create', 'org:read', 'org:update', 'org:delete',
        'brand:create', 'brand:read', 'brand:update', 'brand:delete',
        'subscription:*', 'content:*', 'strategy:*', 'publish:*',
        'audit:read', 'settings:*',
    ],
    [RoleType.ORG_ADMIN]: [
        'user:create', 'user:read', 'user:update',
        'brand:create', 'brand:read', 'brand:update', 'brand:delete',
        'subscription:read', 'subscription:update',
        'content:*', 'strategy:*', 'publish:*',
        'audit:read',
    ],
    [RoleType.BRAND_ADMIN]: [
        'user:read', 'user:update',
        'brand:read', 'brand:update',
        'subscription:read', 'subscription:update',
        'content:*', 'strategy:*', 'publish:*',
    ],
    [RoleType.EDITOR]: [
        'brand:read',
        'content:create', 'content:read', 'content:update',
        'strategy:create', 'strategy:read', 'strategy:update',
        'publish:read', 'publish:execute',
    ],
    [RoleType.VIEWER]: [
        'brand:read',
        'content:read',
        'strategy:read',
        'publish:read',
    ],
};
let Role = class Role {
    hasPermission(permission) {
        if (this.permissions.includes('*'))
            return true;
        if (this.permissions.includes(permission))
            return true;
        const [resource] = permission.split(':');
        if (this.permissions.includes(`${resource}:*`))
            return true;
        return false;
    }
    static getRoleDescription(code) {
        const descriptions = {
            [RoleType.SUPER_ADMIN]: '超级管理员 - 拥有系统全部权限',
            [RoleType.ORG_ADMIN]: '组织管理员 - 管理企业内所有资源',
            [RoleType.BRAND_ADMIN]: '品牌管理员 - 管理单个品牌',
            [RoleType.EDITOR]: '内容编辑 - 创建和编辑内容',
            [RoleType.VIEWER]: '查看者 - 仅查看数据',
        };
        return descriptions[code] || '';
    }
};
exports.Role = Role;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Role.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: '[]' }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Role.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Role.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Role.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Role.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Role.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, user => user.role),
    __metadata("design:type", Array)
], Role.prototype, "users", void 0);
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('roles')
], Role);
//# sourceMappingURL=role.entity.js.map