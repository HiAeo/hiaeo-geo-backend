import { PaymentConfigService } from './payment-config.service';
import { PaymentSecurityService } from '../security/payment-security.service';
export interface AlipayUnifiedOrderResult {
    success: boolean;
    paymentUrl?: string;
    qrCode?: string;
    tradeNo?: string;
    outTradeNo?: string;
    errorMessage?: string;
}
export interface AlipayQueryResult {
    success: boolean;
    tradeNo?: string;
    outTradeNo?: string;
    tradeStatus?: string;
    totalAmount?: number;
    errorMessage?: string;
}
export interface AlipayRefundResult {
    success: boolean;
    refundNo?: string;
    refundAmount?: number;
    errorMessage?: string;
}
export declare class AlipayProvider {
    private configService;
    private securityService;
    private readonly logger;
    constructor(configService: PaymentConfigService, securityService: PaymentSecurityService);
    qrCodePay(params: {
        outTradeNo: string;
        totalAmount: number;
        subject: string;
    }): Promise<AlipayUnifiedOrderResult>;
    unifiedOrder(params: {
        outTradeNo: string;
        totalAmount: number;
        subject: string;
        returnUrl?: string;
    }): Promise<AlipayUnifiedOrderResult>;
    queryOrder(outTradeNo: string): Promise<AlipayQueryResult>;
    refund(params: {
        outTradeNo: string;
        refundAmount: number;
        refundReason?: string;
    }): Promise<AlipayRefundResult>;
    verifyNotify(postData: any): {
        valid: boolean;
        tradeStatus?: string;
        data?: any;
    };
    processNotify(postData: any): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateAlipaySign;
    private verifySign;
}
