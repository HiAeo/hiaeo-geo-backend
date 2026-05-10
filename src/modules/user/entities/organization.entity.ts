"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 组织类型
 */
export enum OrganizationType {
  ENTERPRISE = 'enterprise',     // 企业
  INDIVIDUAL = 'individual',     // 个人
  TRIAL = 'trial',               // 试用
}

/**
 * 组织套餐级别
 */
export enum OrganizationTier {
  FREE = 'free',                 // 免费版
  BASIC = 'basic',               // 基础版
  PROFESSIONAL = 'professional', // 专业版
  ENTERPRISE = 'enterprise',     // 企业版
}

/**
 * 组织实体 - 租户
 */
@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shortName: string;

  @Column({ type: 'simple-enum', enum: OrganizationType, default: OrganizationType.INDIVIDUAL })
  type: OrganizationType;

  @Column({ type: 'simple-enum', enum: OrganizationTier, default: OrganizationTier.FREE })
  tier: OrganizationTier;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'int', default: 1 })
  userCount: number;  // 当前用户数

  @Column({ type: 'int', default: 1 })
  brandCount: number; // 当前品牌数

  @Column({ type: 'int', default: 1 })
  maxUsers: number;   // 最大用户数限制

  @Column({ type: 'int', default: 1 })
  maxBrands: number;  // 最大品牌数限制

  @Column({ type: 'json', default: '{}' })
  settings: Record<string, any>;

  @Column({ type: 'datetime', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'datetime', nullable: true })
  subscriptionEndsAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 检查是否试用中
   */
  isInTrial(): boolean {
    if (this.tier !== OrganizationTier.FREE) return false;
    if (!this.trialEndsAt) return false;
    return new Date() < this.trialEndsAt;
  }

  /**
   * 检查用户数是否超限
   */
  canAddUser(): boolean {
    return this.userCount < this.maxUsers;
  }

  /**
   * 检查品牌数是否超限
   */
  canAddBrand(): boolean {
    return this.brandCount < this.maxBrands;
  }
}
