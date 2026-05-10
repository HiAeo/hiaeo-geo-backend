import { Injectable, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  /**
   * 支付宝统一收款
   */
  async alipayUnifiedOrder(params: UnifiedOrderParams): Promise<UnifiedOrderResult> {
    const isSandbox = this.configService.get('ALIPAY_SANDBOX', 'false') === 'true';
    const appId = this.configService.get('ALIPAY_APP_ID', '');
    const privateKey = this.configService.get('ALIPAY_PRIVATE_KEY', '');
    const alipayPublicKey = this.configService.get('ALIPAY_PUBLIC_KEY', '');
    const mockPayment = this.configService.get('MOCK_PAYMENT', 'true') === 'true';

    if (!appId || !privateKey || !alipayPublicKey) {
      // 开发环境或启用模拟支付时返回模拟数据
      if (process.env.NODE_ENV === 'development' || mockPayment) {
        return {
          success: true,
          paymentUrl: `https://openapi.alipay.com/gateway.do?mock=true&outTradeNo=${params.outTradeNo}`,
          tradeNo: 'ALI' + Date.now(),
        };
      }
      throw new BadRequestException('支付宝配置未完成');
    }

    try {
      // 生成签名并调用支付宝
      const bizContent = {
        out_trade_no: params.outTradeNo,
        total_amount: params.totalAmount,
        subject: params.subject,
        body: params.body || params.subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        timeout_express: '30m',
      };

      // 实际实现需要使用支付宝 SDK
      // 这里返回模拟数据，实际应调用 alipay-sdk
      return {
        success: true,
        paymentUrl: `https://openapi.alipay.com/gateway.do?outTradeNo=${params.outTradeNo}`,
        tradeNo: 'ALI' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * 微信支付统一收款
   */
  async wechatUnifiedOrder(params: UnifiedOrderParams): Promise<UnifiedOrderResult> {
    const mchId = this.configService.get('WECHAT_MCH_ID', '');
    const apiKey = this.configService.get('WECHAT_API_KEY', '');
    const appId = this.configService.get('WECHAT_APP_ID', '');
    const mockPayment = this.configService.get('MOCK_PAYMENT', 'true') === 'true';

    if (!mchId || !apiKey || !appId) {
      // 开发环境或启用模拟支付时返回模拟数据
      if (process.env.NODE_ENV === 'development' || mockPayment) {
        return {
          success: true,
          codeUrl: `weixin://wxpay/bizpayurl?pr=${Date.now()}`,
          tradeNo: 'WX' + Date.now(),
        };
      }
      throw new BadRequestException('微信支付配置未完成');
    }

    try {
      // 生成签名并调用微信支付
      const nonceStr = this.generateNonceStr();
      
      // 实际实现需要使用微信支付 SDK
      // 这里返回模拟数据
      return {
        success: true,
        codeUrl: `weixin://wxpay/bizpayurl?outTradeNo=${params.outTradeNo}`,
        tradeNo: 'WX' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * 支付宝回调验证
   */
  verifyAlipayNotify(params: any): boolean {
    // 实际实现需要使用支付宝 SDK 验证签名
    // 这里简化处理：检查 trade_status 或 tradeStatus
    const tradeStatus = params.trade_status || params.tradeStatus;
    return tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED';
  }

  /**
   * 微信回调验证
   */
  verifyWechatNotify(params: any): boolean {
    // 实际实现需要验证签名
    return params.result_code === 'SUCCESS' && params.return_code === 'SUCCESS';
  }

  /**
   * 支付宝退款
   */
  async alipayRefund(outTradeNo: string, refundAmount: number, refundReason: string) {
    const isSandbox = this.configService.get('ALIPAY_SANDBOX', 'false') === 'true';
    
    if (isSandbox || process.env.NODE_ENV === 'development') {
      return {
        success: true,
        refundNo: 'REFUND_ALI' + Date.now(),
        refundAmount,
      };
    }

    // 实际实现需要调用支付宝退款接口
    return {
      success: true,
      refundNo: 'REFUND_ALI' + Date.now(),
      refundAmount,
    };
  }

  /**
   * 微信退款
   */
  async wechatRefund(outTradeNo: string, totalAmount: number, refundAmount: number, refundReason: string) {
    const mchId = this.configService.get('WECHAT_MCH_ID', '');
    
    if (!mchId || process.env.NODE_ENV === 'development') {
      return {
        success: true,
        refundNo: 'REFUND_WX' + Date.now(),
        refundAmount,
      };
    }

    // 实际实现需要调用微信退款接口
    return {
      success: true,
      refundNo: 'REFUND_WX' + Date.now(),
      refundAmount,
    };
  }

  /**
   * 查询支付宝订单状态
   */
  async queryAlipayOrder(outTradeNo: string) {
    // 实际实现需要调用支付宝查询接口
    return {
      success: true,
      tradeStatus: 'WAIT_BUYER_PAY',
    };
  }

  /**
   * 查询微信订单状态
   */
  async queryWechatOrder(outTradeNo: string) {
    // 实际实现需要调用微信查询接口
    return {
      success: true,
      tradeState: 'NOTPAY',
    };
  }

  /**
   * 关闭支付宝订单
   */
  async closeAlipayOrder(outTradeNo: string) {
    // 实际实现需要调用支付宝关闭接口
    return {
      success: true,
    };
  }

  /**
   * 关闭微信订单
   */
  async closeWechatOrder(outTradeNo: string) {
    // 实际实现需要调用微信关闭接口
    return {
      success: true,
    };
  }

  private generateNonceStr(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
