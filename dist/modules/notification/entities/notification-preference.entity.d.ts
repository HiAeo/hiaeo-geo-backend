import { NotificationChannel } from './notification.entity';
export declare class NotificationPreference {
    id: string;
    userId: string;
    emailEnabled: boolean;
    emailTypes: string[];
    smsEnabled: boolean;
    smsTypes: string[];
    quietHoursStart: string;
    quietHoursEnd: string;
    quietHoursEnabled: boolean;
    marketingEnabled: boolean;
    aggregationMode: 'realtime' | 'hourly' | 'daily';
    updatedAt: Date;
    isQuietHours(): boolean;
    isTypeAllowed(type: string, channel: NotificationChannel): boolean;
}
