"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 审计日志实体 - T112
 */
@Entity('audit_logs')
@Index(['organizationId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;  // create, read, update, delete, login, logout, etc.

  @Column({ type: 'varchar', length: 100 })
  resource: string;  // user, brand, content, subscription, etc.

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  before: Record<string, any>;  // 修改前的数据

  @Column({ type: 'json', nullable: true })
  after: Record<string, any>;   // 修改后的数据

  @Column({ type: 'varchar', length: 50 })
  ip: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  location: string;  // IP地理位置

  @Column({ type: 'boolean', default: false })
  isSensitive: boolean;  // 敏感操作标记

  @Column({ type: 'simple-enum', enum: ['success', 'failure'], default: 'success' })
  result: 'success' | 'failure';

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  /**
   * 获取操作描述
   */
  static getActionDescription(action: string, resource: string): string {
    const descriptions: Record<string, string> = {
      'user:create': `创建用户`,
      'user:update': `更新用户`,
      'user:delete': `删除用户`,
      'user:login': `用户登录`,
      'user:logout': `用户登出`,
      'brand:create': `创建品牌`,
      'brand:update': `更新品牌`,
      'brand:delete': `删除品牌`,
      'content:create': `创建内容`,
      'content:publish': `发布内容`,
      'subscription:upgrade': `升级套餐`,
      'subscription:cancel': `取消订阅`,
      'settings:update': `更新设置`,
    };
    return descriptions[`${resource}:${action}`] || `${action} ${resource}`;
  }
}
