export declare enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    WECHAT = "wechat",
    ALIPAY = "alipay",
    CARD = "card",
    BANK_TRANSFER = "bank_transfer"
}
export declare class Order {
    id: string;
    orderNo: string;
    userId: string;
    packageId: string;
    packageName: string;
    amount: number;
    originalAmount: number;
    discount: number;
    status: string;
    paymentMethod: string;
    paymentTime: Date;
    transactionId: string;
    remark: string;
    createdAt: Date;
    updatedAt: Date;
}
