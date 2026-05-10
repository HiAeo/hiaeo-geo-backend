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
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const team_service_1 = require("../services/team.service");
const team_member_entity_1 = require("../entities/team-member.entity");
let TeamController = class TeamController {
    constructor(teamService) {
        this.teamService = teamService;
    }
    async getMembers(organizationId, userId) {
        const role = await this.teamService.getMemberRole(organizationId, userId);
        if (!role) {
            return { message: '您不是团队成员', members: [] };
        }
        return this.teamService.getMembers(organizationId);
    }
    async addMember(organizationId, userId, body) {
        const operatorRole = await this.teamService.getMemberRole(organizationId, userId);
        if (!operatorRole) {
            return { message: '您不是团队成员' };
        }
        if (operatorRole !== team_member_entity_1.TeamRole.OWNER && operatorRole !== team_member_entity_1.TeamRole.ADMIN) {
            return { message: '只有管理员可以添加成员' };
        }
        return this.teamService.addMember(organizationId, body.targetUserId, body.role, userId);
    }
    async removeMember(organizationId, targetUserId, userId) {
        const operatorRole = await this.teamService.getMemberRole(organizationId, userId);
        if (!operatorRole) {
            return { message: '您不是团队成员' };
        }
        await this.teamService.removeMember(organizationId, targetUserId, operatorRole);
        return { success: true };
    }
    async updateMemberRole(organizationId, targetUserId, userId, role) {
        const operatorRole = await this.teamService.getMemberRole(organizationId, userId);
        if (!operatorRole) {
            return { message: '您不是团队成员' };
        }
        return this.teamService.updateMemberRole(organizationId, targetUserId, role, operatorRole);
    }
    async getMemberRole(organizationId, targetUserId, userId) {
        const role = await this.teamService.getMemberRole(organizationId, targetUserId);
        return { role };
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, common_1.Get)(':organizationId/members'),
    (0, swagger_1.ApiOperation)({ summary: '获取团队成员列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回团队成员列表' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)(':organizationId/members'),
    (0, swagger_1.ApiOperation)({ summary: '添加团队成员' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '添加成功' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':organizationId/members/:targetUserId'),
    (0, swagger_1.ApiOperation)({ summary: '移除团队成员' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '移除成功' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('targetUserId')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Put)(':organizationId/members/:targetUserId/role'),
    (0, swagger_1.ApiOperation)({ summary: '更新成员角色' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('targetUserId')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Get)(':organizationId/members/:targetUserId'),
    (0, swagger_1.ApiOperation)({ summary: '获取成员角色' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回成员角色' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Param)('targetUserId')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMemberRole", null);
exports.TeamController = TeamController = __decorate([
    (0, swagger_1.ApiTags)('团队管理'),
    (0, common_1.Controller)('teams'),
    __metadata("design:paramtypes", [team_service_1.TeamService])
], TeamController);
//# sourceMappingURL=team.controller.js.map