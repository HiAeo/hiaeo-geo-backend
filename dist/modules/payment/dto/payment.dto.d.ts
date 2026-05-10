export declare enum PaymentMethod {
    ALIPAY = "alipay",
    WECHAT = "wechat",
    BALANCE = "balance",
    ENTERPRISE = "enterprise"
}
export declare enum PaymentChannel {
    WEB = "web",
    APP = "app",
    QR = "qr",
    H5 = "h5"
}
export declare class CreatePaymentDto {
    orderId: string;
    paymentMethod: PaymentMethod;
    channel?: PaymentChannel;
    clientIp?: string;
    deviceId?: string;
}
export declare class PaymentResultDto {
    success: boolean;
    paymentUrl?: string;
    qrCode?: string;
    appParams?: {
        appId: string;
        partnerId: string;
        prepayId: string;
        package: string;
        nonceStr: string;
        timestamp: string;
        sign: string;
    };
    outTradeNo?: string;
    tradeNo?: string;
    errorMessage?: string;
}
export declare class PaymentQueryDto {
    outTradeNo: string;
}
export declare class PaymentCallbackDto {
    tradeStatus?: string;
    outTradeNo?: string;
    tradeNo?: string;
    totalAmount?: number;
    buyerPayAmount?: number;
}
export declare class RefundApplyDto {
    orderId: string;
    refundAmount: number;
    refundReason?: string;
}
export declare class RefundResultDto {
    success: boolean;
    refundNo?: string;
    refundAmount?: number;
    errorMessage?: string;
}
