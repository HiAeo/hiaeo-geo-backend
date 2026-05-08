import { NotificationService } from '../services/notification.service';
import { NotificationType, NotificationChannel, NotificationStatus } from '../entities/notification.entity';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    findAll(req: any, type?: NotificationType, status?: NotificationStatus, unreadOnly?: string, page?: string, limit?: string): Promise<{
        notifications: import("../entities/notification.entity").Notification[];
        total: number;
        unreadCount: number;
    }>;
    getPreferences(req: any): Promise<import("../entities").NotificationPreference>;
    updatePreferences(dto: {
        emailEnabled?: boolean;
        emailTypes?: string[];
        smsEnabled?: boolean;
        smsTypes?: string[];
        quietHoursStart?: string;
        quietHoursEnd?: string;
        quietHoursEnabled?: boolean;
        marketingEnabled?: boolean;
        aggregationMode?: 'realtime' | 'hourly' | 'daily';
    }, req: any): Promise<import("../entities").NotificationPreference>;
    markAsRead(id: string, req: any): Promise<{
        message: string;
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
    sendNotification(dto: {
        userId: string;
        userName: string;
        title: string;
        content: string;
        type: NotificationType;
        channels?: NotificationChannel[];
        actionUrl?: string;
        actionText?: string;
    }, req: any): Promise<{
        message: string;
        count: number;
    }>;
    sendBulk(dto: {
        userIds: string[];
        title: string;
        content: string;
        type: NotificationType;
        channels?: NotificationChannel[];
    }, req: any): Promise<{
        message: string;
        count: number;
    }>;
}
