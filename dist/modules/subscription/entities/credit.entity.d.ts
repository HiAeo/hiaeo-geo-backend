export declare enum TransactionType {
    EARN = "earn",
    CONSUME = "consume",
    REFUND = "refund",
    BONUS = "bonus"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum SourceType {
    PURCHASE = "purchase",
    SUBSCRIPTION = "subscription",
    REFERRAL = "referral",
    BONUS = "bonus",
    DAILY = "daily",
    DIAGNOSTIC = "diagnostic",
    CONTENT_GENERATION = "content_generation"
}
export declare class Credit {
    id: string;
    userId: string;
    balance: number;
    totalEarned: number;
    totalConsumed: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreditTransaction {
    id: string;
    userId: string;
    type: TransactionType;
    sourceType: SourceType;
    amount: number;
    status: TransactionStatus;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    relatedOrderId: string;
    createdAt: Date;
}
