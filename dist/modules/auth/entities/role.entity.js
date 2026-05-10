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
exports.BrandRole = void 0;
const typeorm_1 = require("typeorm");
const user_role_entity_1 = require("./user-role.entity");
let BrandRole = class BrandRole {
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
};
exports.BrandRole = BrandRole;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BrandRole.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BrandRole.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], BrandRole.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: '[]' }),
    __metadata("design:type", Array)
], BrandRole.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BrandRole.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BrandRole.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BrandRole.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BrandRole.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BrandRole.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_role_entity_1.UserRole, userRole => userRole.role),
    __metadata("design:type", Array)
], BrandRole.prototype, "userRoles", void 0);
exports.BrandRole = BrandRole = __decorate([
    (0, typeorm_1.Entity)('brand_roles')
], BrandRole);
//# sourceMappingURL=role.entity.js.map