import { PaymentConfigService } from './payment-config.service';
import { PaymentSecurityService } from '../security/payment-security.service';
export interface WechatUnifiedOrderResult {
    success: boolean;
    codeUrl?: string;
    prepayId?: string;
    tradeNo?: string;
    outTradeNo?: string;
    errorMessage?: string;
}
export interface WechatQueryResult {
    success: boolean;
    tradeNo?: string;
    outTradeNo?: string;
    tradeState?: string;
    tradeStateDesc?: string;
    totalAmount?: number;
    errorMessage?: string;
}
export interface WechatRefundResult {
    success: boolean;
    refundNo?: string;
    refundAmount?: number;
    errorMessage?: string;
}
export declare class WechatProvider {
    private configService;
    private securityService;
    private readonly logger;
    constructor(configService: PaymentConfigService, securityService: PaymentSecurityService);
    unifiedOrder(params: {
        outTradeNo: string;
        totalAmount: number;
        subject: string;
    }): Promise<WechatUnifiedOrderResult>;
    h5Pay(params: {
        outTradeNo: string;
        totalAmount: number;
        subject: string;
    }): Promise<{
        success: boolean;
        mwebUrl?: string;
        errorMessage?: string;
    }>;
    queryOrder(outTradeNo: string): Promise<WechatQueryResult>;
    refund(params: {
        outTradeNo: string;
        totalAmount: number;
        refundAmount: number;
        refundReason?: string;
    }): Promise<WechatRefundResult>;
    verifyNotify(params: {
        headers: Record<string, string>;
        body: string;
    }): Promise<{
        valid: boolean;
        data?: any;
    }>;
    processNotify(params: {
        headers: Record<string, string>;
        body: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateWechatSign;
    private getExpireTime;
}
