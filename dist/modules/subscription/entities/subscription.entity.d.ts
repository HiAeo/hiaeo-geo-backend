export declare enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    SUSPENDED = "suspended"
}
export declare class Subscription {
    id: string;
    userId: string;
    packageId: string;
    orderId: string;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    diagnosisUsed: number;
    diagnosisLimit: number;
    autoRenew: boolean;
    createdAt: Date;
    updatedAt: Date;
}
