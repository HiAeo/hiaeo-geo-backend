export declare enum NotificationType {
    SYSTEM = "system",
    SUBSCRIPTION = "subscription",
    PAYMENT = "payment",
    CONTENT = "content",
    SECURITY = "security",
    MARKETING = "marketing"
}
export declare enum NotificationChannel {
    IN_APP = "in_app",
    EMAIL = "email",
    SMS = "sms"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed",
    READ = "read"
}
export declare class Notification {
    id: string;
    organizationId: string;
    userId: string;
    userName: string;
    title: string;
    content: string;
    type: NotificationType;
    channels: NotificationChannel[];
    status: NotificationStatus;
    data: Record<string, any>;
    actionUrl: string;
    actionText: string;
    sentAt: Date;
    errorMessage: string;
    readAt: Date;
    createdAt: Date;
    markAsRead(): void;
    isRead(): boolean;
}
