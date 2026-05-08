import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationChannel, NotificationStatus } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
export declare class NotificationService {
    private notificationRepository;
    private preferenceRepository;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, preferenceRepository: Repository<NotificationPreference>);
    send(params: {
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
    }): Promise<Notification[]>;
    private sendEmail;
    private sendSMS;
    private sendInApp;
    private sendChannelNotification;
    findAll(userId: string, options?: {
        type?: NotificationType;
        status?: NotificationStatus;
        unreadOnly?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string, userId: string): Promise<void>;
    getPreferences(userId: string): Promise<NotificationPreference>;
    updatePreferences(userId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreference>;
    sendBulk(params: {
        userIds: string[];
        title: string;
        content: string;
        type: NotificationType;
        channels?: NotificationChannel[];
    }): Promise<number>;
    cleanup(daysToKeep?: number): Promise<number>;
}
