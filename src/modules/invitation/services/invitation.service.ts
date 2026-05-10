import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from '../entities/invitation.entity';
import { CreditService } from '../../subscription/services/credit.service';
import { SourceType } from '../../subscription/entities/credit.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private creditService: CreditService,
  ) {}

  /**
   * 生成邀请码
   */
  async generateInvitationCode(userId: string): Promise<Invitation> {
    // 检查用户是否已有邀请码
    const existing = await this.invitationRepository.findOne({
      where: { inviterId: userId },
    });
    
    if (existing) {
      return existing;
    }

    // 生成唯一的邀请码
    const code = this.generateUniqueCode();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1年后过期

    const invitation = this.invitationRepository.create({
      inviterId: userId,
      code,
      status: InvitationStatus.PENDING,
      rewardCredits: 50, // 默认奖励50积分
      rewardDiscount: 0,
      expiresAt,
    });

    return this.invitationRepository.save(invitation);
  }

  /**
   * 获取用户的邀请码
   */
  async getUserInvitationCode(userId: string): Promise<Invitation> {
    let invitation = await this.invitationRepository.findOne({
      where: { inviterId: userId },
    });

    if (!invitation) {
      invitation = await this.generateInvitationCode(userId);
    }

    return invitation;
  }

  /**
   * 通过邀请码获取邀请信息
   */
  async getInvitationByCode(code: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { code },
    });

    if (!invitation) {
      throw new NotFoundException('邀请码不存在');
    }

    // 检查是否过期
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('邀请码已过期');
    }

    return invitation;
  }

  /**
   * 使用邀请码注册（绑定邀请关系）
   */
  async useInvitationCode(code: string, inviteeId: string): Promise<Invitation> {
    const invitation = await this.getInvitationByCode(code);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('邀请码已被使用或已失效');
    }

    if (invitation.inviterId === inviteeId) {
      throw new BadRequestException('不能使用自己的邀请码');
    }

    // 检查被邀请人是否已经使用过其他邀请码
    const existingUsage = await this.invitationRepository.findOne({
      where: { inviteeId },
    });

    if (existingUsage && existingUsage.status === InvitationStatus.COMPLETED) {
      throw new ConflictException('您已经使用过邀请码');
    }

    invitation.inviteeId = inviteeId;
    invitation.invitedAt = new Date();
    await this.invitationRepository.save(invitation);

    return invitation;
  }

  /**
   * 完成邀请（被邀请人付费后调用）
   */
  async completeInvitation(orderId: string, inviteeId: string): Promise<Invitation | null> {
    const invitation = await this.invitationRepository.findOne({
      where: { inviteeId, status: InvitationStatus.PENDING },
    });

    if (!invitation) {
      return null;
    }

    invitation.status = InvitationStatus.COMPLETED;
    invitation.referralOrderId = orderId;
    invitation.completedAt = new Date();
    await this.invitationRepository.save(invitation);

    // 发放推荐奖励给邀请人
    if (invitation.rewardCredits > 0) {
      try {
        await this.creditService.earnCredits({
          userId: invitation.inviterId,
          amount: invitation.rewardCredits,
          sourceType: SourceType.REFERRAL,
          description: `推荐新用户奖励`,
          relatedOrderId: orderId,
        });
      } catch (error) {
        console.error('发放推荐奖励失败:', error);
      }
    }

    return invitation;
  }

  /**
   * 获取用户的邀请统计
   */
  async getInvitationStats(userId: string) {
    const invitations = await this.invitationRepository.find({
      where: { inviterId: userId },
    });

    const totalInvitations = invitations.length;
    const completedInvitations = invitations.filter(
      i => i.status === InvitationStatus.COMPLETED,
    ).length;
    const pendingInvitations = invitations.filter(
      i => i.status === InvitationStatus.PENDING,
    ).length;

    const totalRewards = invitations
      .filter(i => i.status === InvitationStatus.COMPLETED)
      .reduce((sum, i) => sum + (i.rewardCredits || 0), 0);

    return {
      totalInvitations,
      completedInvitations,
      pendingInvitations,
      totalRewards,
      invitationCode: invitations[0]?.code || null,
    };
  }

  /**
   * 获取邀请列表
   */
  async getInvitations(userId: string, page = 1, limit = 10) {
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

  /**
   * 生成唯一的邀请码
   */
  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HIAEO${code}`;
  }
}
