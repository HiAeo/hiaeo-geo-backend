"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 通知类型
 */
export enum NotificationType {
  SYSTEM = 'system',           // 系统通知
  SUBSCRIPTION = 'subscription', // 订阅通知
  PAYMENT = 'payment',         // 支付通知
  CONTENT = 'content',         // 内容通知
  SECURITY = 'security',       // 安全通知
  MARKETING = 'marketing',     // 营销通知
}

/**
 * 通知渠道
 */
export enum NotificationChannel {
  IN_APP = 'in_app',           // 站内信
  EMAIL = 'email',             // 邮件
  SMS = 'sms',                 // 短信
}

/**
 * 通知状态
 */
export enum NotificationStatus {
  PENDING = 'pending',         // 待发送
  SENT = 'sent',               // 已发送
  FAILED = 'failed',           // 发送失败
  READ = 'read',               // 已读
}

/**
 * 通知实体 - T140/T141
 */
@Entity('notifications')
@Index(['organizationId', 'createdAt'])
@Index(['userId', 'status'])
@Index(['type', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'simple-array' })
  channels: NotificationChannel[];  // 发送渠道

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;  // 额外数据

  @Column({ type: 'varchar', length: 255, nullable: true })
  actionUrl: string;  // 点击跳转链接

  @Column({ type: 'varchar', length: 100, nullable: true })
  actionText: string;  // 操作按钮文字

  // 发送记录
  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  // 读取记录
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  /**
   * 标记为已读
   */
  markAsRead(): void {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
  }

  /**
   * 检查是否已读
   */
  isRead(): boolean {
    return this.status === NotificationStatus.READ;
  }
}
