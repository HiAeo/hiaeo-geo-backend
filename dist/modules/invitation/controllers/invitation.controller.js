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
exports.InvitationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invitation_service_1 = require("../services/invitation.service");
let InvitationController = class InvitationController {
    constructor(invitationService) {
        this.invitationService = invitationService;
    }
    async getMyInvitationCode(userId) {
        return this.invitationService.getUserInvitationCode(userId);
    }
    async generateInvitationCode(userId) {
        return this.invitationService.generateInvitationCode(userId);
    }
    async getInvitationStats(userId) {
        return this.invitationService.getInvitationStats(userId);
    }
    async getInvitations(userId, page, limit) {
        return this.invitationService.getInvitations(userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
    }
    async useInvitationCode(userId, code) {
        return this.invitationService.useInvitationCode(code, userId);
    }
    async validateInvitationCode(code) {
        return this.invitationService.getInvitationByCode(code);
    }
};
exports.InvitationController = InvitationController;
__decorate([
    (0, common_1.Get)('code'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的邀请码' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回邀请码信息' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getMyInvitationCode", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: '生成邀请码' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '返回邀请码信息' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "generateInvitationCode", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取邀请统计' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回邀请统计信息' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getInvitationStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取邀请列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回邀请列表' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getInvitations", null);
__decorate([
    (0, common_1.Post)('use'),
    (0, swagger_1.ApiOperation)({ summary: '使用邀请码' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回邀请绑定结果' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "useInvitationCode", null);
__decorate([
    (0, common_1.Get)('validate/:code'),
    (0, swagger_1.ApiOperation)({ summary: '验证邀请码' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回邀请码信息' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "validateInvitationCode", null);
exports.InvitationController = InvitationController = __decorate([
    (0, swagger_1.ApiTags)('邀请管理'),
    (0, common_1.Controller)('invitations'),
    __metadata("design:paramtypes", [invitation_service_1.InvitationService])
], InvitationController);
//# sourceMappingURL=invitation.controller.js.map