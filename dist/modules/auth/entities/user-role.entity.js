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
exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const role_entity_1 = require("./role.entity");
let UserRole = class UserRole {
    isExpired() {
        if (!this.expiresAt)
            return false;
        return new Date() > this.expiresAt;
    }
    canAccessKnowledge(knowledgeId) {
        if (!this.knowledgeScope || this.knowledgeScope.length === 0) {
            return true;
        }
        return this.knowledgeScope.includes(knowledgeId);
    }
};
exports.UserRole = UserRole;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], UserRole.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], UserRole.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.BrandRole, role => role.userRoles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'roleId' }),
    __metadata("design:type", role_entity_1.BrandRole)
], UserRole.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: '[]' }),
    __metadata("design:type", Array)
], UserRole.prototype, "knowledgeScope", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], UserRole.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], UserRole.prototype, "grantedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserRole.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserRole.prototype, "updatedAt", void 0);
exports.UserRole = UserRole = __decorate([
    (0, typeorm_1.Entity)('user_roles'),
    (0, typeorm_1.Index)(['userId', 'roleId'], { unique: false })
], UserRole);
//# sourceMappingURL=user-role.entity.js.map