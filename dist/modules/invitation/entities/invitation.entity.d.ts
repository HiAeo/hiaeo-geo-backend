export declare enum InvitationStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class Invitation {
    id: string;
    inviterId: string;
    inviteeId: string;
    code: string;
    status: InvitationStatus;
    rewardCredits: number;
    rewardDiscount: number;
    referralOrderId: string;
    invitedAt: Date;
    completedAt: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
