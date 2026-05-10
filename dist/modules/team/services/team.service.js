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
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_member_entity_1 = require("../entities/team-member.entity");
const organization_entity_1 = require("../../user/entities/organization.entity");
let TeamService = class TeamService {
    constructor(teamMemberRepository, organizationRepository) {
        this.teamMemberRepository = teamMemberRepository;
        this.organizationRepository = organizationRepository;
    }
    async addMember(organizationId, userId, role, invitedBy) {
        const org = await this.organizationRepository.findOne({
            where: { id: organizationId },
        });
        if (!org) {
            throw new common_1.NotFoundException('组织不存在');
        }
        if (org.tier === organization_entity_1.OrganizationTier.FREE && org.userCount >= 1) {
            throw new common_1.BadRequestException('免费版仅支持单人使用，请升级套餐');
        }
        if (org.tier === organization_entity_1.OrganizationTier.BASIC && org.userCount >= 3) {
            throw new common_1.BadRequestException('基础版最多3人，请升级套餐');
        }
        if (org.tier === organization_entity_1.OrganizationTier.PROFESSIONAL && org.userCount >= 10) {
            throw new common_1.BadRequestException('专业版最多10人，请升级套餐');
        }
        const existing = await this.teamMemberRepository.findOne({
            where: { organizationId, userId },
        });
        if (existing) {
            throw new common_1.BadRequestException('该用户已是团队成员');
        }
        const member = this.teamMemberRepository.create({
            organizationId,
            userId,
            role,
            invitedBy,
            status: team_member_entity_1.TeamMemberStatus.ACTIVE,
            acceptedAt: new Date(),
        });
        await this.organizationRepository.increment({ id: organizationId }, 'userCount', 1);
        return this.teamMemberRepository.save(member);
    }
    async removeMember(organizationId, targetUserId, operatorRole) {
        if (operatorRole !== team_member_entity_1.TeamRole.OWNER && operatorRole !== team_member_entity_1.TeamRole.ADMIN) {
            throw new common_1.ForbiddenException('只有管理员可以移除成员');
        }
        const member = await this.teamMemberRepository.findOne({
            where: { organizationId, userId: targetUserId },
        });
        if (!member) {
            throw new common_1.NotFoundException('成员不存在');
        }
        if (member.role === team_member_entity_1.TeamRole.OWNER) {
            throw new common_1.BadRequestException('无法移除所有者');
        }
        await this.teamMemberRepository.remove(member);
        await this.organizationRepository.decrement({ id: organizationId }, 'userCount', 1);
    }
    async updateMemberRole(organizationId, targetUserId, newRole, operatorRole) {
        if (operatorRole !== team_member_entity_1.TeamRole.OWNER) {
            throw new common_1.ForbiddenException('只有所有者可以修改角色');
        }
        const member = await this.teamMemberRepository.findOne({
            where: { organizationId, userId: targetUserId },
        });
        if (!member) {
            throw new common_1.NotFoundException('成员不存在');
        }
        if (member.role === team_member_entity_1.TeamRole.OWNER) {
            throw new common_1.BadRequestException('无法修改所有者角色');
        }
        member.role = newRole;
        return this.teamMemberRepository.save(member);
    }
    async getMembers(organizationId) {
        return this.teamMemberRepository.find({
            where: { organizationId },
            order: { createdAt: 'ASC' },
        });
    }
    async getMemberRole(organizationId, userId) {
        const member = await this.teamMemberRepository.findOne({
            where: { organizationId, userId },
        });
        return member?.role || null;
    }
    async isAdminOrOwner(organizationId, userId) {
        const role = await this.getMemberRole(organizationId, userId);
        return role === team_member_entity_1.TeamRole.OWNER || role === team_member_entity_1.TeamRole.ADMIN;
    }
    async canManageBilling(organizationId, userId) {
        const role = await this.getMemberRole(organizationId, userId);
        return role === team_member_entity_1.TeamRole.OWNER;
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMember)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TeamService);
//# sourceMappingURL=team.service.js.map