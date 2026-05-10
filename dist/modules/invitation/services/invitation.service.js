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
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invitation_entity_1 = require("../entities/invitation.entity");
const credit_service_1 = require("../../subscription/services/credit.service");
const credit_entity_1 = require("../../subscription/entities/credit.entity");
let InvitationService = class InvitationService {
    constructor(invitationRepository, creditService) {
        this.invitationRepository = invitationRepository;
        this.creditService = creditService;
    }
    async generateInvitationCode(userId) {
        const existing = await this.invitationRepository.findOne({
            where: { inviterId: userId },
        });
        if (existing) {
            return existing;
        }
        const code = this.generateUniqueCode();
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        const invitation = this.invitationRepository.create({
            inviterId: userId,
            code,
            status: invitation_entity_1.InvitationStatus.PENDING,
            rewardCredits: 50,
            rewardDiscount: 0,
            expiresAt,
        });
        return this.invitationRepository.save(invitation);
    }
    async getUserInvitationCode(userId) {
        let invitation = await this.invitationRepository.findOne({
            where: { inviterId: userId },
        });
        if (!invitation) {
            invitation = await this.generateInvitationCode(userId);
        }
        return invitation;
    }
    async getInvitationByCode(code) {
        const invitation = await this.invitationRepository.findOne({
            where: { code },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('邀请码不存在');
        }
        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
            invitation.status = invitation_entity_1.InvitationStatus.EXPIRED;
            await this.invitationRepository.save(invitation);
            throw new common_1.BadRequestException('邀请码已过期');
        }
        return invitation;
    }
    async useInvitationCode(code, inviteeId) {
        const invitation = await this.getInvitationByCode(code);
        if (invitation.status !== invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException('邀请码已被使用或已失效');
        }
        if (invitation.inviterId === inviteeId) {
            throw new common_1.BadRequestException('不能使用自己的邀请码');
        }
        const existingUsage = await this.invitationRepository.findOne({
            where: { inviteeId },
        });
        if (existingUsage && existingUsage.status === invitation_entity_1.InvitationStatus.COMPLETED) {
            throw new common_1.ConflictException('您已经使用过邀请码');
        }
        invitation.inviteeId = inviteeId;
        invitation.invitedAt = new Date();
        await this.invitationRepository.save(invitation);
        return invitation;
    }
    async completeInvitation(orderId, inviteeId) {
        const invitation = await this.invitationRepository.findOne({
            where: { inviteeId, status: invitation_entity_1.InvitationStatus.PENDING },
        });
        if (!invitation) {
            return null;
        }
        invitation.status = invitation_entity_1.InvitationStatus.COMPLETED;
        invitation.referralOrderId = orderId;
        invitation.completedAt = new Date();
        await this.invitationRepository.save(invitation);
        if (invitation.rewardCredits > 0) {
            try {
                await this.creditService.earnCredits({
                    userId: invitation.inviterId,
                    amount: invitation.rewardCredits,
                    sourceType: credit_entity_1.SourceType.REFERRAL,
                    description: `推荐新用户奖励`,
                    relatedOrderId: orderId,
                });
            }
            catch (error) {
                console.error('发放推荐奖励失败:', error);
            }
        }
        return invitation;
    }
    async getInvitationStats(userId) {
        const invitations = await this.invitationRepository.find({
            where: { inviterId: userId },
        });
        const totalInvitations = invitations.length;
        const completedInvitations = invitations.filter(i => i.status === invitation_entity_1.InvitationStatus.COMPLETED).length;
        const pendingInvitations = invitations.filter(i => i.status === invitation_entity_1.InvitationStatus.PENDING).length;
        const totalRewards = invitations
            .filter(i => i.status === invitation_entity_1.InvitationStatus.COMPLETED)
            .reduce((sum, i) => sum + (i.rewardCredits || 0), 0);
        return {
            totalInvitations,
            completedInvitations,
            pendingInvitations,
            totalRewards,
            invitationCode: invitations[0]?.code || null,
        };
    }
    async getInvitations(userId, page = 1, limit = 10) {
        const [invitations, total] = await this.invitationRepository.findAndCount({
            where: { inviterId: userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            invitations,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    generateUniqueCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `HIAEO${code}`;
    }
};
exports.InvitationService = InvitationService;
exports.InvitationService = InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        credit_service_1.CreditService])
], InvitationService);
//# sourceMappingURL=invitation.service.js.map