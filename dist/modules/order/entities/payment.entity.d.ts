export declare enum PaymentStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIAL_REFUND = "partial_refund",
    EXPIRED = "expired"
}
export declare class Payment {
    id: string;
    orderId: string;
    paymentNo: string;
    status: PaymentStatus;
    totalAmount: number;
    paidAmount: number;
    refundedAmount: number;
    paymentMethod: string;
    channelTransactionId: string;
    paidAt: Date;
    expireAt: Date;
    channelResponse: Record<string, any>;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Refund {
    id: string;
    orderId: string;
    paymentId: string;
    refundNo: string;
    refundAmount: number;
    reason: string;
    adminId: string;
    status: string;
    channelRefundId: string;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
