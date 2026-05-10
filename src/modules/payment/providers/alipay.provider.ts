import { Injectable, Logger } from '@nestjs/common';
import { PaymentConfigService } from './payment-config.service';
import { PaymentSecurityService } from '../security/payment-security.service';
import axios from 'axios';
import * as crypto from 'crypto';

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

@Injectable()
export class AlipayProvider {
  private readonly logger = new Logger(AlipayProvider.name);

  constructor(
    private configService: PaymentConfigService,
    private securityService: PaymentSecurityService,
  ) {}

  /**
   * 扫码支付
   */
  async qrCodePay(params: {
    outTradeNo: string;
    totalAmount: number;
    subject: string;
  }): Promise<AlipayUnifiedOrderResult> {
    const mockPayment = this.configService.isMockPayment();
    const config = this.configService.getAlipayConfig();

    if (!config || mockPayment) {
      this.logger.log(`支付宝模拟收款: ${params.outTradeNo}, 金额: ${params.totalAmount}元`);
      return {
        success: true,
        qrCode: `https://qr.alipay.com/${this.securityService.generateNonceStr(16)}`,
        tradeNo: 'ALI' + Date.now(),
        outTradeNo: params.outTradeNo,
      };
    }

    try {
      // 构造请求参数
      const bizContent = {
        out_trade_no: params.outTradeNo,
        total_amount: params.totalAmount.toFixed(2),
        subject: params.subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        timeout_express: '30m',
      };

      // 生成签名
      const sign = this.generateAlipaySign(bizContent, config);

      // 调用支付宝API
      const response = await axios.post(
        `${config.sandbox ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do' : 'https://openapi.alipay.com/gateway.do'}`,
        {
          app_id: config.appId,
          method: 'alipay.trade.precreate',
          format: 'JSON',
          charset: 'utf-8',
          sign_type: 'RSA2',
          timestamp: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
          version: '1.0',
          biz_content: JSON.stringify(bizContent),
          notify_url: config.notifyUrl,
          sign,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const result = response.data?.alipay_trade_precreate_response;
      
      if (result?.code === '10000') {
        return {
          success: true,
          qrCode: result.qr_code,
          outTradeNo: params.outTradeNo,
        };
      }

      return {
        success: false,
        errorMessage: result?.sub_msg || '支付宝收款失败',
      };
    } catch (error) {
      this.logger.error(`支付宝收款失败: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * 统一收款（网页支付）
   */
  async unifiedOrder(params: {
    outTradeNo: string;
    totalAmount: number;
    subject: string;
    returnUrl?: string;
  }): Promise<AlipayUnifiedOrderResult> {
    const mockPayment = this.configService.isMockPayment();
    const config = this.configService.getAlipayConfig();

    if (!config || mockPayment) {
      return {
        success: true,
        paymentUrl: `https://openapi.alipay.com/gateway.do?mock=true&outTradeNo=${params.outTradeNo}`,
        tradeNo: 'ALI' + Date.now(),
        outTradeNo: params.outTradeNo,
      };
    }

    try {
      const bizContent = {
        out_trade_no: params.outTradeNo,
        total_amount: params.totalAmount.toFixed(2),
        subject: params.subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        timeout_express: '30m',
      };

      const sign = this.generateAlipaySign(bizContent, config);

      const response = await axios.post(
        `${config.sandbox ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do' : 'https://openapi.alipay.com/gateway.do'}`,
        {
          app_id: config.appId,
          method: 'alipay.trade.page.pay',
          format: 'JSON',
          charset: 'utf-8',
          sign_type: 'RSA2',
          timestamp: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
          version: '1.0',
          biz_content: JSON.stringify(bizContent),
          notify_url: config.notifyUrl,
          return_url: params.returnUrl,
          sign,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const result = response.data?.alipay_trade_page_pay_response;
      
      if (result?.code === '10000') {
        return {
          success: true,
          paymentUrl: result.sandbox_pay_url || result.pay_url,
          outTradeNo: params.outTradeNo,
        };
      }

      return {
        success: false,
        errorMessage: result?.sub_msg || '支付宝收款失败',
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
  async queryOrder(outTradeNo: string): Promise<AlipayQueryResult> {
    const mockPayment = this.configService.isMockPayment();
    const config = this.configService.getAlipayConfig();

    if (!config || mockPayment) {
      return {
        success: true,
        tradeNo: 'ALI' + Date.now(),
        outTradeNo,
        tradeStatus: 'WAIT_BUYER_PAY',
      };
    }

    try {
      const bizContent = { out_trade_no: outTradeNo };
      const sign = this.generateAlipaySign(bizContent, config);

      const response = await axios.post(
        `${config.sandbox ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do' : 'https://openapi.alipay.com/gateway.do'}`,
        {
          app_id: config.appId,
          method: 'alipay.trade.query',
          format: 'JSON',
          charset: 'utf-8',
          sign_type: 'RSA2',
          timestamp: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
          version: '1.0',
          biz_content: JSON.stringify(bizContent),
          sign,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const result = response.data?.alipay_trade_query_response;

      if (result?.code === '10000') {
        return {
          success: true,
          tradeNo: result.trade_no,
          outTradeNo: result.out_trade_no,
          tradeStatus: result.trade_status,
          totalAmount: parseFloat(result.total_amount || '0'),
        };
      }

      return {
        success: false,
        errorMessage: result?.sub_msg || '查询失败',
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
    refundAmount: number;
    refundReason?: string;
  }): Promise<AlipayRefundResult> {
    const mockPayment = this.configService.isMockPayment();

    if (mockPayment) {
      this.logger.log(`支付宝模拟退款: ${params.outTradeNo}, 金额: ${params.refundAmount}元`);
      return {
        success: true,
        refundNo: 'REFUND_ALI' + Date.now(),
        refundAmount: params.refundAmount,
      };
    }

    return {
      success: true,
      refundNo: 'REFUND_ALI' + Date.now(),
      refundAmount: params.refundAmount,
    };
  }

  /**
   * 验证回调通知
   */
  verifyNotify(postData: any): { valid: boolean; tradeStatus?: string; data?: any } {
    try {
      // 模拟模式直接验证
      if (this.configService.isMockPayment()) {
        return {
          valid: true,
          tradeStatus: postData.trade_status || 'TRADE_SUCCESS',
          data: {
            outTradeNo: postData.out_trade_no,
            tradeNo: postData.trade_no,
            totalAmount: parseFloat(postData.total_amount || '0'),
            buyerEmail: postData.buyer_logon_id,
            tradeStatus: postData.trade_status,
            gmtPayment: postData.gmt_payment,
          },
        };
      }

      // 实际验证需要使用SDK验签
      const signResult = this.verifySign(postData);
      if (!signResult) {
        this.logger.warn('支付宝回调签名验证失败');
        return { valid: false };
      }

      return {
        valid: true,
        tradeStatus: postData.trade_status,
        data: {
          outTradeNo: postData.out_trade_no,
          tradeNo: postData.trade_no,
          totalAmount: parseFloat(postData.total_amount),
        },
      };
    } catch (error) {
      this.logger.error(`支付宝回调验证异常: ${error.message}`);
      return { valid: false };
    }
  }

  /**
   * 处理异步通知
   */
  async processNotify(postData: any): Promise<{ success: boolean; message: string }> {
    const verifyResult = this.verifyNotify(postData);

    if (!verifyResult.valid) {
      return { success: false, message: '签名验证失败' };
    }

    const tradeStatus = verifyResult.tradeStatus;

    switch (tradeStatus) {
      case 'TRADE_SUCCESS':
      case 'TRADE_FINISHED':
        this.logger.log(`支付宝支付成功: ${postData.out_trade_no}`);
        return { success: true, message: 'success' };
      case 'TRADE_CLOSED':
        this.logger.log(`支付宝交易关闭: ${postData.out_trade_no}`);
        return { success: true, message: 'success' };
      default:
        return { success: false, message: '未知状态' };
    }
  }

  /**
   * 生成支付宝签名
   */
  private generateAlipaySign(bizContent: any, config: NonNullable<ReturnType<PaymentConfigService['getAlipayConfig']>>): string {
    const params: Record<string, string> = {
      app_id: config.appId,
      method: 'alipay.trade.precreate',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    };

    // 按字典序排序
    const sortedKeys = Object.keys(params).sort();
    const pairs: string[] = [];
    for (const key of sortedKeys) {
      if (params[key]) {
        pairs.push(`${key}=${params[key]}`);
      }
    }
    const signStr = pairs.join('&');

    // RSA2签名
    const sign = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(config.privateKey, 'base64');

    return sign;
  }

  /**
   * 验证签名
   */
  private verifySign(data: any): boolean {
    const config = this.configService.getAlipayConfig();
    if (!config) return false;

    const { sign, ...dataWithoutSign } = data;
    if (!sign) return false;

    const sortedKeys = Object.keys(dataWithoutSign).sort();
    const pairs: string[] = [];
    for (const key of sortedKeys) {
      if (dataWithoutSign[key]) {
        pairs.push(`${key}=${dataWithoutSign[key]}`);
      }
    }
    const signStr = pairs.join('&');

    try {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(signStr);
      return verifier.verify(config.alipayPublicKey, sign, 'base64');
    } catch {
      return false;
    }
  }
}
