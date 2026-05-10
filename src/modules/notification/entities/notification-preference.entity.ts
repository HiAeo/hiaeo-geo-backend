"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationChannel } from './notification.entity';

/**
 * 通知偏好设置实体 - T142
 */
@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  // 邮件通知设置
  @Column({ type: 'boolean', default: true })
  emailEnabled: boolean;  // 是否启用邮件

  @Column({ type: 'json', nullable: true })
  emailTypes: string[];  // 允许的邮件通知类型

  // 短信通知设置
  @Column({ type: 'boolean', default: true })
  smsEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  smsTypes: string[];  // 允许的短信通知类型

  // 免打扰时段
  @Column({ type: 'varchar', length: 10, default: '22:00' })
  quietHoursStart: string;  // 开始时间

  @Column({ type: 'varchar', length: 10, default: '08:00' })
  quietHoursEnd: string;  // 结束时间

  @Column({ type: 'boolean', default: false })
  quietHoursEnabled: boolean;

  // 营销通知
  @Column({ type: 'boolean', default: false })
  marketingEnabled: boolean;  // 是否接收营销通知

  // 聚合设置
  @Column({ type: 'simple-enum', enum: ['realtime', 'hourly', 'daily'], default: 'realtime' })
  aggregationMode: 'realtime' | 'hourly' | 'daily';

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 检查是否在免打扰时段
   */
  isQuietHours(): boolean {
    if (!this.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (this.quietHoursStart > this.quietHoursEnd) {
      // 跨天情况
      return currentTime >= this.quietHoursStart || currentTime <= this.quietHoursEnd;
    }

    return currentTime >= this.quietHoursStart && currentTime <= this.quietHoursEnd;
  }

  /**
   * 检查是否允许该类型通知
   */
  isTypeAllowed(type: string, channel: NotificationChannel): boolean {
    if (channel === NotificationChannel.IN_APP) return true;

    if (channel === NotificationChannel.EMAIL) {
      if (!this.emailEnabled) return false;
      if (this.emailTypes && !this.emailTypes.includes(type)) return false;
    }

    if (channel === NotificationChannel.SMS) {
      if (!this.smsEnabled) return false;
      if (this.smsTypes && !this.smsTypes.includes(type)) return false;
    }

    if (type === 'marketing' && !this.marketingEnabled) return false;

    return true;
  }
}
