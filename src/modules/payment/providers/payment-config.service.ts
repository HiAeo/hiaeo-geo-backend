import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class PaymentConfigService {
  private readonly logger = new Logger(PaymentConfigService.name);

  constructor(private configService: ConfigService) {}

  /**
   * 检查支付宝是否已配置
   */
  isAlipayConfigured(): boolean {
    const appId = this.configService.get('ALIPAY_APP_ID', '');
    const privateKey = this.configService.get('ALIPAY_PRIVATE_KEY', '');
    const alipayPublicKey = this.configService.get('ALIPAY_PUBLIC_KEY', '');
    return !!(appId && privateKey && alipayPublicKey);
  }

  /**
   * 检查微信支付是否已配置
   */
  isWechatConfigured(): boolean {
    const mchId = this.configService.get('WECHAT_MCH_ID', '');
    const serialNo = this.configService.get('WECHAT_SERIAL_NO', '');
    const privateKey = this.configService.get('WECHAT_PRIVATE_KEY', '');
    return !!(mchId && serialNo && privateKey);
  }

  /**
   * 获取支付宝配置
   */
  getAlipayConfig(): {
    appId: string;
    privateKey: string;
    alipayPublicKey: string;
    sandbox: boolean;
    notifyUrl: string;
  } | null {
    if (!this.isAlipayConfigured()) {
      return null;
    }

    return {
      appId: this.configService.get('ALIPAY_APP_ID', ''),
      privateKey: this.configService.get('ALIPAY_PRIVATE_KEY', ''),
      alipayPublicKey: this.configService.get('ALIPAY_PUBLIC_KEY', ''),
      sandbox: this.configService.get('ALIPAY_SANDBOX', 'false') === 'true',
      notifyUrl: this.getNotifyUrl('alipay'),
    };
  }

  /**
   * 获取微信支付配置
   */
  getWechatConfig(): {
    mchId: string;
    serialNo: string;
    privateKey: string;
    apiv3Key: string;
    sandbox: boolean;
    notifyUrl: string;
  } | null {
    if (!this.isWechatConfigured()) {
      return null;
    }

    return {
      mchId: this.configService.get('WECHAT_MCH_ID', ''),
      serialNo: this.configService.get('WECHAT_SERIAL_NO', ''),
      privateKey: this.configService.get('WECHAT_PRIVATE_KEY', ''),
      apiv3Key: this.configService.get('WECHAT_APIV3_KEY', ''),
      sandbox: this.configService.get('WECHAT_SANDBOX', 'false') === 'true',
      notifyUrl: this.getNotifyUrl('wechat'),
    };
  }

  /**
   * 获取回调URL
   */
  private getNotifyUrl(type: 'alipay' | 'wechat'): string {
    const baseUrl = this.configService.get('API_BASE_URL', 'http://localhost:3000');
    return `${baseUrl}/api/payments/callback/${type}`;
  }

  /**
   * 检查是否为生产环境
   */
  isProduction(): boolean {
    return this.configService.isProduction();
  }

  /**
   * 检查是否启用模拟支付
   */
  isMockPayment(): boolean {
    if (this.isProduction()) {
      return this.configService.get('MOCK_PAYMENT', 'false') === 'true';
    }
    return this.configService.get('MOCK_PAYMENT', 'true') === 'true';
  }

  /**
   * 获取支付密钥
   */
  getPaymentSecret(): string {
    return this.configService.get('PAYMENT_SECRET_KEY', 'default-secret');
  }

  /**
   * 获取微信APP ID
   */
  getWechatAppId(): string {
    return this.configService.get('WECHAT_APP_ID', '');
  }
}
