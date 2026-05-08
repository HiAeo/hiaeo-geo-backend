import { ConfigService } from '../../../config/config.service';
export interface UnifiedOrderParams {
    outTradeNo: string;
    totalAmount: number;
    subject: string;
    body?: string;
    notifyUrl: string;
    returnUrl?: string;
}
export interface UnifiedOrderResult {
    success: boolean;
    paymentUrl?: string;
    qrCode?: string;
    codeUrl?: string;
    tradeNo?: string;
    errorMessage?: string;
}
export interface PayNotifyParams {
    outTradeNo: string;
    tradeNo: string;
    tradeStatus: string;
    totalAmount: number;
    [key: string]: any;
}
export declare class PaymentService {
    private configService;
    constructor(configService: ConfigService);
    alipayUnifiedOrder(params: UnifiedOrderParams): Promise<UnifiedOrderResult>;
    wechatUnifiedOrder(params: UnifiedOrderParams): Promise<UnifiedOrderResult>;
    verifyAlipayNotify(params: PayNotifyParams): boolean;
    verifyWechatNotify(params: any): boolean;
    alipayRefund(outTradeNo: string, refundAmount: number, refundReason: string): Promise<{
        success: boolean;
        refundNo: string;
        refundAmount: number;
    }>;
    wechatRefund(outTradeNo: string, totalAmount: number, refundAmount: number, refundReason: string): Promise<{
        success: boolean;
        refundNo: string;
        refundAmount: number;
    }>;
    queryAlipayOrder(outTradeNo: string): Promise<{
        success: boolean;
        tradeStatus: string;
    }>;
    queryWechatOrder(outTradeNo: string): Promise<{
        success: boolean;
        tradeState: string;
    }>;
    closeAlipayOrder(outTradeNo: string): Promise<{
        success: boolean;
    }>;
    closeWechatOrder(outTradeNo: string): Promise<{
        success: boolean;
    }>;
    private generateNonceStr;
}
