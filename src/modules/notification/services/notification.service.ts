"use strict";
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationChannel, NotificationStatus } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
  ) {}

  /**
   * 发送通知 - T140/T141
   */
  async send(params: {
    organizationId: string;
    userId: string;
    userName: string;
    title: string;
    content: string;
    type: NotificationType;
    channels?: NotificationChannel[];
    data?: Record<string, any>;
    actionUrl?: string;
    actionText?: string;
  }): Promise<Notification[]> {
    const channels = params.channels || [NotificationChannel.IN_APP];
    const notifications: Notification[] = [];

    for (const channel of channels) {
      const notification = this.notificationRepository.create({
        organizationId: params.organizationId,
        userId: params.userId,
        userName: params.userName,
        title: params.title,
        content: params.content,
        type: params.type,
        channels: [channel],
        status: NotificationStatus.PENDING,
        data: params.data,
        actionUrl: params.actionUrl,
        actionText: params.actionText,
      });

      notifications.push(await this.notificationRepository.save(notification));
    }

    // 异步发送各渠道通知
    for (const notification of notifications) {
      this.sendChannelNotification(notification).catch(err => {
        this.logger.error(`Failed to send notification ${notification.id}`, err);
      });
    }

    return notifications;
  }

  /**
   * 发送邮件 - T141
   */
  private async sendEmail(notification: Notification): Promise<void> {
    // 简化实现：实际应该调用邮件服务
    this.logger.log(`[Email] Sending to ${notification.userName}: ${notification.title}`);
    
    // 模拟发送
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
    await this.notificationRepository.save(notification);
  }

  /**
   * 发送短信 - T141
   */
  private async sendSMS(notification: Notification): Promise<void> {
    // 简化实现：实际应该调用短信服务
    this.logger.log(`[SMS] Sending to ${notification.userName}: ${notification.title}`);
    
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
    await this.notificationRepository.save(notification);
  }

  /**
   * 发送站内信
   */
  private async sendInApp(notification: Notification): Promise<void> {
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
    await this.notificationRepository.save(notification);
  }

  /**
   * 根据渠道发送通知
   */
  private async sendChannelNotification(notification: Notification): Promise<void> {
    const channel = notification.channels[0];

    switch (channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmail(notification);
        break;
      case NotificationChannel.SMS:
        await this.sendSMS(notification);
        break;
      case NotificationChannel.IN_APP:
        await this.sendInApp(notification);
        break;
    }
  }

  /**
   * 获取用户通知列表
   */
  async findAll(userId: string, options?: {
    type?: NotificationType;
    status?: NotificationStatus;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const { type, status, unreadOnly, page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository.createQueryBuilder('n')
      .where('n.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('n.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('n.status = :status', { status });
    }

    if (unreadOnly) {
      queryBuilder.andWhere('n.status != :readStatus', { readStatus: NotificationStatus.READ });
    }

    const [notifications, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('n.createdAt', 'DESC')
      .getManyAndCount();

    // 获取未读数量
    const unreadCount = await this.notificationRepository.count({
      where: { userId, status: NotificationStatus.SENT },
    });

    return { notifications, total, unreadCount };
  }

  /**
   * 标记为已读
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (notification) {
      notification.markAsRead();
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.SENT },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
  }

  /**
   * 删除通知
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id: notificationId, userId });
  }

  /**
   * 获取通知偏好设置
   */
  async getPreferences(userId: string): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({ where: { userId } });
    
    if (!preference) {
      preference = this.preferenceRepository.create({ userId });
      await this.preferenceRepository.save(preference);
    }

    return preference;
  }

  /**
   * 更新通知偏好设置 - T142
   */
  async updatePreferences(userId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({ where: { userId } });
    
    if (!preference) {
      preference = this.preferenceRepository.create({ userId, ...updates });
    } else {
      Object.assign(preference, updates);
    }

    return this.preferenceRepository.save(preference);
  }

  /**
   * 发送批量通知
   */
  async sendBulk(params: {
    userIds: string[];
    title: string;
    content: string;
    type: NotificationType;
    channels?: NotificationChannel[];
  }): Promise<number> {
    let sentCount = 0;

    for (const userId of params.userIds) {
      await this.send({
        organizationId: 'system',
        userId,
        userName: 'System',
        title: params.title,
        content: params.content,
        type: params.type,
        channels: params.channels,
      });
      sentCount++;
    }

    return sentCount;
  }

  /**
   * 清理过期通知（保留30天）
   */
  async cleanup(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('status = :status', { status: NotificationStatus.READ })
      .execute();

    return result.affected || 0;
  }
}
