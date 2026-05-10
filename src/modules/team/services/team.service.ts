import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember, TeamRole, TeamMemberStatus } from '../entities/team-member.entity';
import { Organization, OrganizationTier } from '../../user/entities/organization.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  /**
   * 添加团队成员
   */
  async addMember(
    organizationId: string,
    userId: string,
    role: TeamRole,
    invitedBy: string,
  ): Promise<TeamMember> {
    // 检查组织是否存在
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });
    
    if (!org) {
      throw new NotFoundException('组织不存在');
    }

    // 检查用户数限制
    if (org.tier === OrganizationTier.FREE && org.userCount >= 1) {
      throw new BadRequestException('免费版仅支持单人使用，请升级套餐');
    }
    if (org.tier === OrganizationTier.BASIC && org.userCount >= 3) {
      throw new BadRequestException('基础版最多3人，请升级套餐');
    }
    if (org.tier === OrganizationTier.PROFESSIONAL && org.userCount >= 10) {
      throw new BadRequestException('专业版最多10人，请升级套餐');
    }

    // 检查是否已经是成员
    const existing = await this.teamMemberRepository.findOne({
      where: { organizationId, userId },
    });

    if (existing) {
      throw new BadRequestException('该用户已是团队成员');
    }

    const member = this.teamMemberRepository.create({
      organizationId,
      userId,
      role,
      invitedBy,
      status: TeamMemberStatus.ACTIVE, // 直接激活
      acceptedAt: new Date(),
    });

    // 更新组织用户数
    await this.organizationRepository.increment(
      { id: organizationId },
      'userCount',
      1,
    );

    return this.teamMemberRepository.save(member);
  }

  /**
   * 移除团队成员
   */
  async removeMember(
    organizationId: string,
    targetUserId: string,
    operatorRole: TeamRole,
  ): Promise<void> {
    if (operatorRole !== TeamRole.OWNER && operatorRole !== TeamRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以移除成员');
    }

    const member = await this.teamMemberRepository.findOne({
      where: { organizationId, userId: targetUserId },
    });

    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    if (member.role === TeamRole.OWNER) {
      throw new BadRequestException('无法移除所有者');
    }

    await this.teamMemberRepository.remove(member);

    // 更新组织用户数
    await this.organizationRepository.decrement(
      { id: organizationId },
      'userCount',
      1,
    );
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    newRole: TeamRole,
    operatorRole: TeamRole,
  ): Promise<TeamMember> {
    if (operatorRole !== TeamRole.OWNER) {
      throw new ForbiddenException('只有所有者可以修改角色');
    }

    const member = await this.teamMemberRepository.findOne({
      where: { organizationId, userId: targetUserId },
    });

    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    if (member.role === TeamRole.OWNER) {
      throw new BadRequestException('无法修改所有者角色');
    }

    member.role = newRole;
    return this.teamMemberRepository.save(member);
  }

  /**
   * 获取团队成员列表
   */
  async getMembers(organizationId: string): Promise<TeamMember[]> {
    return this.teamMemberRepository.find({
      where: { organizationId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 获取成员角色
   */
  async getMemberRole(
    organizationId: string,
    userId: string,
  ): Promise<TeamRole | null> {
    const member = await this.teamMemberRepository.findOne({
      where: { organizationId, userId },
    });
    return member?.role || null;
  }

  /**
   * 检查用户是否是管理员或所有者
   */
  async isAdminOrOwner(organizationId: string, userId: string): Promise<boolean> {
    const role = await this.getMemberRole(organizationId, userId);
    return role === TeamRole.OWNER || role === TeamRole.ADMIN;
  }

  /**
   * 检查用户是否有计费权限
   */
  async canManageBilling(organizationId: string, userId: string): Promise<boolean> {
    const role = await this.getMemberRole(organizationId, userId);
    return role === TeamRole.OWNER;
  }
}
