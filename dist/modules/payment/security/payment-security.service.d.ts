export interface PaymentSignature {
    signType: 'RSA2' | 'HMAC-SHA256';
    signature: string;
}
export interface PaymentVerifyResult {
    valid: boolean;
    message: string;
    data?: any;
}
export declare class PaymentSecurityService {
    private readonly logger;
    generateOutTradeNo(prefix?: string): string;
    generateNonceStr(length?: number): string;
    validateAmount(amount: number): boolean;
    yuanToFen(yuan: number): number;
    fenToYuan(fen: number): number;
    calculateOrderSignature(orderId: string, amount: number, secret: string): string;
    verifyOrderSignature(orderId: string, amount: number, signature: string, secret: string): boolean;
    verifyAlipaySign(signData: any, sign: string, publicKey: string): boolean;
    verifyWechatSign(signature: string, timestamp: string, nonce: string, body: string, certificate: string): Promise<boolean>;
    signWechatRequest(method: string, url: string, timestamp: string, nonce: string, body: string, privateKey: string): Promise<string>;
    riskCheck(orderInfo: {
        userId: string;
        amount: number;
        ip: string;
        deviceId?: string;
    }): Promise<{
        pass: boolean;
        reason?: string;
    }>;
    encryptSensitiveData(data: string, publicKey: string): string;
    decryptSensitiveData(encryptedData: string, privateKey: string): string;
    generateRefundNo(prefix?: string): string;
    logPayment(operation: string, params: any, result: any): void;
    private maskSensitiveData;
}
