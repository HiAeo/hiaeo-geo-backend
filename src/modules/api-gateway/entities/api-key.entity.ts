"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * API Key状态
 */
export enum ApiKeyStatus {
  ACTIVE = 'active',         // 正常
  SUSPENDED = 'suspended',   // 暂停
  EXPIRED = 'expired',       // 已过期
  REVOKED = 'revoked',       // 已吊销
}

/**
 * API Key权限范围
 */
export enum ApiKeyScope {
  DIAGNOSIS = 'diagnosis',           // 诊断
  CONTENT_GENERATE = 'content:generate',  // 内容生成
  STRATEGY_GENERATE = 'strategy:generate', // 策略生成
  SEMANTIC_QUERY = 'semantic:query', // 语义查询
  ALL = 'all',                       // 全部权限
}

/**
 * API Key实体 - T120
 */
@Entity('api_keys')
@Index(['organizationId', 'status'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  @Index()
  key: string;  // API Key (格式: hiaeo_sk_xxxx)

  @Column({ type: 'varchar', length: 64 })
  secret: string;  // API Secret (用于签名)

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  scopes: ApiKeyScope[];  // 权限范围

  @Column({ type: 'simple-enum', enum: ApiKeyStatus, default: ApiKeyStatus.ACTIVE })
  status: ApiKeyStatus;

  @Column({ type: 'int', default: 0 })
  rateLimit: number;  // 每分钟请求限制

  @Column({ type: 'int', default: 0 })
  monthlyLimit: number;  // 每月请求限制

  @Column({ type: 'int', default: 0 })
  usedCount: number;  // 已使用次数

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;  // 过期时间

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt: Date;  // 最后使用时间

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastUsedIp: string;  // 最后使用IP

  @Column({ type: 'boolean', default: false })
  isProduction: boolean;  // 是否生产环境Key

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  /**
   * 检查是否过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * 检查是否有效
   */
  isValid(): boolean {
    return this.status === ApiKeyStatus.ACTIVE && !this.isExpired();
  }

  /**
   * 检查是否有指定权限
   */
  hasScope(scope: ApiKeyScope): boolean {
    if (this.scopes.includes(ApiKeyScope.ALL)) return true;
    return this.scopes.includes(scope);
  }
}
