import { ConfigService } from '../../../config/config.service';
export declare class PaymentConfigService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    isAlipayConfigured(): boolean;
    isWechatConfigured(): boolean;
    getAlipayConfig(): {
        appId: string;
        privateKey: string;
        alipayPublicKey: string;
        sandbox: boolean;
        notifyUrl: string;
    } | null;
    getWechatConfig(): {
        mchId: string;
        serialNo: string;
        privateKey: string;
        apiv3Key: string;
        sandbox: boolean;
        notifyUrl: string;
    } | null;
    private getNotifyUrl;
    isProduction(): boolean;
    isMockPayment(): boolean;
    getPaymentSecret(): string;
    getWechatAppId(): string;
}
