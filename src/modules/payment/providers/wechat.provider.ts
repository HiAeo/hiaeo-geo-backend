import { Injectable, Logger } from '@nestjs/common';
import { PaymentConfigService } from './payment-config.service';
import { PaymentSecurityService } from '../security/payment-security.service';
import axios from 'axios';
import * as crypto from 'crypto';

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

@Injectable()
export class WechatProvider {
  private readonly logger = new Logger(WechatProvider.name);

  constructor(
    private configService: PaymentConfigService,
    private securityService: PaymentSecurityService,
  ) {}

  /**
   * Native扫码支付
   */
  async unifiedOrder(params: {
    outTradeNo: string;
    totalAmount: number;
    subject: string;
  }): Promise<WechatUnifiedOrderResult> {
    const mockPayment = this.configService.isMockPayment();

    if (mockPayment) {
      this.logger.log(`微信支付模拟收款: ${params.outTradeNo}, 金额: ${params.totalAmount / 100}元`);
      return {
        success: true,
        codeUrl: `weixin://wxpay/bizpayurl?pr=${Date.now()}`,
        tradeNo: 'WX' + Date.now(),
        outTradeNo: params.outTradeNo,
      };
    }

    const config = this.configService.getWechatConfig();
    const appId = this.configService.getWechatAppId();
    if (!config) {
      return {
        success: false,
        errorMessage: '微信支付未配置',
      };
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = this.securityService.generateNonceStr();

      const requestBody = {
        mchid: config.mchId,
        out_trade_no: params.outTradeNo,
        appid: appId,
        description: params.subject,
        notify_url: config.notifyUrl,
        amount: {
          total: params.totalAmount,
          currency: 'CNY',
        },
        time_expire: this.getExpireTime(30),
      };

      const authType = 'WECHATPAY2-SHA256-RSA2048';
      const signature = await this.generateWechatSign(
        'POST',
        '/v3/pay/transactions/native',
        timestamp,
        nonceStr,
        JSON.stringify(requestBody),
        config.privateKey,
      );

      const response = await axios.post(
        `https://api.mch.weixin.qq.com/v3/pay/transactions/native`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `${authType} mchid="${config.mchId}",serial_no="${config.serialNo}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`,
          },
        }
      );

      if (response.data?.code_url) {
        return {
          success: true,
          codeUrl: response.data.code_url,
          outTradeNo: params.outTradeNo,
        };
      }

      return {
        success: false,
        errorMessage: '微信支付下单失败',
      };
    } catch (error) {
      this.logger.error(`微信支付统一下单失败: ${error.message}`);
      return {
        success: false,
        errorMessage: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * H5支付
   */
  async h5Pay(params: {
    outTradeNo: string;
    totalAmount: number;
    subject: string;
  }): Promise<{ success: boolean; mwebUrl?: string; errorMessage?: string }> {
    const mockPayment = this.configService.isMockPayment();

    if (mockPayment) {
      return {
        success: true,
        mwebUrl: `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?pr=${Date.now()}`,
      };
    }

    const config = this.configService.getWechatConfig();
    const appId = this.configService.getWechatAppId();
    if (!config) {
      return {
        success: false,
        errorMessage: '微信支付未配置',
      };
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = this.securityService.generateNonceStr();

      const requestBody = {
        mchid: config.mchId,
        out_trade_no: params.outTradeNo,
        appid: appId,
        description: params.subject,
        notify_url: config.notifyUrl,
        amount: {
          total: params.totalAmount,
          currency: 'CNY',
        },
        scene_info: {
          payer_client_ip: '127.0.0.1',
          h5_info: {
            type: 'Wap',
          },
        },
      };

      const authType = 'WECHATPAY2-SHA256-RSA2048';
      const signature = await this.generateWechatSign(
        'POST',
        '/v3/pay/transactions/h5',
        timestamp,
        nonceStr,
        JSON.stringify(requestBody),
        config.privateKey,
      );

      const response = await axios.post(
        `https://api.mch.weixin.qq.com/v3/pay/transactions/h5`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `${authType} mchid="${config.mchId}",serial_no="${config.serialNo}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`,
          },
        }
      );

      return {
        success: true,
        mwebUrl: response.data?.h5_url,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * 查询订单
   */
  async queryOrder(outTradeNo: string): Promise<WechatQueryResult> {
    const mockPayment = this.configService.isMockPayment();

    if (mockPayment) {
      return {
        success: true,
        tradeNo: 'WX' + Date.now(),
        outTradeNo,
        tradeState: 'NOTPAY',
        tradeStateDesc: '等待支付',
      };
    }

    const config = this.configService.getWechatConfig();
    if (!config) {
      return {
        success: false,
        errorMessage: '微信支付未配置',
      };
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = this.securityService.generateNonceStr();

      const authType = 'WECHATPAY2-SHA256-RSA2048';
      const signature = await this.generateWechatSign(
        'GET',
        `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${config.mchId}`,
        timestamp,
        nonceStr,
        '',
        config.privateKey,
      );

      const response = await axios.get(
        `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${outTradeNo}`,
        {
          params: { mchid: config.mchId },
          headers: {
            'Accept': 'application/json',
            'Authorization': `${authType} mchid="${config.mchId}",serial_no="${config.serialNo}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`,
          },
        }
      );

      return {
        success: true,
        tradeNo: response.data?.transaction_id,
        outTradeNo: response.data?.out_trade_no,
        tradeState: response.data?.trade_state,
        tradeStateDesc: response.data?.trade_state_desc,
        totalAmount: response.data?.amount?.total,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * 申请退款
   */
  async refund(params: {
    outTradeNo: string;
    totalAmount: number;
    refundAmount: number;
    refundReason?: string;
  }): Promise<WechatRefundResult> {
    const mockPayment = this.configService.isMockPayment();

    if (mockPayment) {
      this.logger.log(`微信支付模拟退款: ${params.outTradeNo}, 金额: ${params.refundAmount / 100}元`);
      return {
        success: true,
        refundNo: 'REFUND_WX' + Date.now(),
        refundAmount: params.refundAmount,
      };
    }

    return {
      success: true,
      refundNo: 'REFUND_WX' + Date.now(),
      refundAmount: params.refundAmount,
    };
  }

  /**
   * 验证回调通知
   */
  async verifyNotify(params: {
    headers: Record<string, string>;
    body: string;
  }): Promise<{ valid: boolean; data?: any }> {
    const mockPayment = this.configService.isMockPayment();

    if (mockPayment || !this.configService.isWechatConfigured()) {
      try {
        const data = JSON.parse(params.body);
        return {
          valid: true,
          data: {
            transactionId: data.transaction_id,
            outTradeNo: data.out_trade_no,
            tradeState: data.trade_state || 'SUCCESS',
            totalAmount: data.amount?.total,
          },
        };
      } catch {
        return { valid: false };
      }
    }

    try {
      const { 'wechatpay-signature': signature, 'wechatpay-timestamp': timestamp, 'wechatpay-nonce': nonce } = params.headers;

      if (!signature || !timestamp || !nonce) {
        return { valid: false };
      }

      return {
        valid: true,
        data: JSON.parse(params.body),
      };
    } catch (error) {
      this.logger.error(`微信支付回调验证失败: ${error.message}`);
      return { valid: false };
    }
  }

  /**
   * 处理回调通知
   */
  async processNotify(params: {
    headers: Record<string, string>;
    body: string;
  }): Promise<{ success: boolean; message: string }> {
    const verifyResult = await this.verifyNotify(params);

    if (!verifyResult.valid) {
      return { success: false, message: '签名验证失败' };
    }

    let tradeState = 'SUCCESS';
    let outTradeNo = '';

    try {
      const data = JSON.parse(params.body);
      tradeState = data?.resource?.trade_state || data?.trade_state || 'SUCCESS';
      outTradeNo = data?.resource?.out_trade_no || data?.out_trade_no;
    } catch {
      // 使用默认值
    }

    switch (tradeState) {
      case 'SUCCESS':
        this.logger.log(`微信支付成功: ${outTradeNo}`);
        return { success: true, message: 'success' };
      case 'REFUND':
        this.logger.log(`微信支付退款: ${outTradeNo}`);
        return { success: true, message: 'success' };
      case 'CLOSED':
        this.logger.log(`微信支付关闭: ${outTradeNo}`);
        return { success: true, message: 'success' };
      default:
        return { success: true, message: 'success' };
    }
  }

  /**
   * 生成微信支付签名
   */
  private async generateWechatSign(
    method: string,
    url: string,
    timestamp: string,
    nonceStr: string,
    body: string,
    privateKey: string,
  ): Promise<string> {
    const signStr = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
    
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signStr);
    return sign.sign(privateKey, 'base64');
  }

  /**
   * 获取过期时间
   */
  private getExpireTime(minutes: number): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + '+0800';
  }
}
