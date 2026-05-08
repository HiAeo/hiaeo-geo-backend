"use strict";
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationType, OrganizationTier } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto';

/**
 * 套餐配置
 */
const TierLimits = {
  [OrganizationTier.FREE]: { maxUsers: 3, maxBrands: 1 },
  [OrganizationTier.BASIC]: { maxUsers: 10, maxBrands: 5 },
  [OrganizationTier.PROFESSIONAL]: { maxUsers: 50, maxBrands: 20 },
  [OrganizationTier.ENTERPRISE]: { maxUsers: -1, maxBrands: -1 }, // 无限制
};

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 创建组织
   */
  async create(dto: CreateOrganizationDto): Promise<Organization> {
    // 创建组织
    const organization = this.organizationRepository.create({
      ...dto,
      tier: OrganizationTier.FREE,
      settings: {
        allowedEngines: ['deepseek', 'kimi'],
      },
    });

    const savedOrg = await this.organizationRepository.save(organization);

    // 试用7天
    savedOrg.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.organizationRepository.save(savedOrg);

    return savedOrg;
  }

  /**
   * 更新组织
   */
  async update(organizationId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException('组织不存在');
    }

    // 如果升级套餐
    if (dto.tier && dto.tier !== org.tier) {
      const limits = TierLimits[dto.tier];
      org.maxUsers = limits.maxUsers;
      org.maxBrands = limits.maxBrands;
    }

    Object.assign(org, dto);
    return this.organizationRepository.save(org);
  }

  /**
   * 获取组织详情
   */
  async findOne(organizationId: string): Promise<Organization> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException('组织不存在');
    }
    return org;
  }

  /**
   * 获取所有组织
   */
  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 删除组织
   */
  async remove(organizationId: string): Promise<void> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException('组织不存在');
    }

    org.isActive = false;
    await this.organizationRepository.save(org);
  }

  /**
   * 更新用户计数
   */
  async updateUserCount(organizationId: string, delta: number): Promise<void> {
    const org = await this.findOne(organizationId);
    
    if (delta > 0 && org.userCount >= org.maxUsers && org.maxUsers !== -1) {
      throw new BadRequestException('用户数量已达上限，请升级套餐');
    }

    org.userCount += delta;
    await this.organizationRepository.save(org);
  }

  /**
   * 更新品牌计数
   */
  async updateBrandCount(organizationId: string, delta: number): Promise<void> {
    const org = await this.findOne(organizationId);
    
    if (delta > 0 && org.brandCount >= org.maxBrands && org.maxBrands !== -1) {
      throw new BadRequestException('品牌数量已达上限，请升级套餐');
    }

    org.brandCount += delta;
    await this.organizationRepository.save(org);
  }

  /**
   * 获取套餐限制
   */
  getTierLimits(tier: OrganizationTier) {
    return TierLimits[tier];
  }
}
