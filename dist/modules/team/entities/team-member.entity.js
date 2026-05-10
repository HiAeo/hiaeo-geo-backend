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
exports.TeamMember = exports.TeamMemberStatus = exports.TeamRole = void 0;
const typeorm_1 = require("typeorm");
var TeamRole;
(function (TeamRole) {
    TeamRole["OWNER"] = "owner";
    TeamRole["ADMIN"] = "admin";
    TeamRole["MEMBER"] = "member";
    TeamRole["VIEWER"] = "viewer";
})(TeamRole || (exports.TeamRole = TeamRole = {}));
var TeamMemberStatus;
(function (TeamMemberStatus) {
    TeamMemberStatus["ACTIVE"] = "active";
    TeamMemberStatus["PENDING"] = "pending";
    TeamMemberStatus["INACTIVE"] = "inactive";
})(TeamMemberStatus || (exports.TeamMemberStatus = TeamMemberStatus = {}));
let TeamMember = class TeamMember {
    canManageMembers() {
        return this.role === TeamRole.OWNER || this.role === TeamRole.ADMIN;
    }
    canModifyOrganization() {
        return this.role === TeamRole.OWNER || this.role === TeamRole.ADMIN;
    }
    canManageBilling() {
        return this.role === TeamRole.OWNER;
    }
};
exports.TeamMember = TeamMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeamMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id' }),
    __metadata("design:type", String)
], TeamMember.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], TeamMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: TeamRole,
        default: TeamRole.MEMBER,
    }),
    __metadata("design:type", String)
], TeamMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'invited_by'
    }),
    __metadata("design:type", String)
], TeamMember.prototype, "invitedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: TeamMemberStatus,
        default: TeamMemberStatus.PENDING,
    }),
    __metadata("design:type", String)
], TeamMember.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], TeamMember.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], TeamMember.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'accepted_at' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "updatedAt", void 0);
exports.TeamMember = TeamMember = __decorate([
    (0, typeorm_1.Entity)('team_members'),
    (0, typeorm_1.Index)(['organizationId']),
    (0, typeorm_1.Index)(['userId'])
], TeamMember);
//# sourceMappingURL=team-member.entity.js.map