import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentSignature {
  signType: 'RSA2' | 'HMAC-SHA256';
  signature: string;
}

export interface PaymentVerifyResult {
  valid: boolean;
  message: string;
  data?: any;
}

@Injectable()
export class PaymentSecurityService {
  private readonly logger = new Logger(PaymentSecurityService.name);

  /**
   * 生成随机订单号
   */
  generateOutTradeNo(prefix: string = 'HIAEO'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 生成随机字符串
   */
  generateNonceStr(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 验证金额（防止小数精度问题）
   */
  validateAmount(amount: number): boolean {
    // 金额必须大于0
    if (amount <= 0) return false;
    
    // 金额最多支持2位小数
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }

  /**
   * 金额单位转换（元转分）
   */
  yuanToFen(yuan: number): number {
    return Math.round(yuan * 100);
  }

  /**
   * 金额单位转换（分转元）
   */
  fenToYuan(fen: number): number {
    return fen / 100;
  }

  /**
   * 计算订单签名（用于内部校验）
   */
  calculateOrderSignature(orderId: string, amount: number, secret: string): string {
    const data = `${orderId}:${amount}:${secret}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 验证订单签名
   */
  verifyOrderSignature(
    orderId: string, 
    amount: number, 
    signature: string, 
    secret: string
  ): boolean {
    const expectedSignature = this.calculateOrderSignature(orderId, amount, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * 支付宝签名验证
   */
  verifyAlipaySign(signData: any, sign: string, publicKey: string): boolean {
    try {
      // 构造待签名字符串
      const signType = signData.sign_type || 'RSA2';
      const signTypeUpper = signType.toUpperCase();
      
      // 移除sign和sign_type字段
      const { sign_type, ...data } = signData;
      
      // 按字典序排序并拼接
      const sortedKeys = Object.keys(data).sort();
      const pairs: string[] = [];
      for (const key of sortedKeys) {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          pairs.push(`${key}=${data[key]}`);
        }
      }
      const signStr = pairs.join('&');

      // 使用公钥验签
      const verifier = crypto.createVerify(signTypeUpper === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1');
      verifier.update(signStr);
      return verifier.verify(publicKey, sign, 'base64');
    } catch (error) {
      this.logger.error(`支付宝签名验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 微信支付签名验证（APIv3）
   */
  async verifyWechatSign(
    signature: string,
    timestamp: string,
    nonce: string,
    body: string,
    certificate: string
  ): Promise<boolean> {
    try {
      // 构造签名串
      const signStr = `${timestamp}\n${nonce}\n${body}\n`;
      
      // 使用平台证书验签
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(signStr);
      return verifier.verify(certificate, signature, 'base64');
    } catch (error) {
      this.logger.error(`微信支付签名验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 微信支付签名生成（APIv3）
   */
  async signWechatRequest(
    method: string,
    url: string,
    timestamp: string,
    nonce: string,
    body: string,
    privateKey: string
  ): Promise<string> {
    // 构造签名串
    const signStr = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
    
    // 使用私钥签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signStr);
    return sign.sign(privateKey, 'base64');
  }

  /**
   * 风控检查
   */
  async riskCheck(orderInfo: {
    userId: string;
    amount: number;
    ip: string;
    deviceId?: string;
  }): Promise<{ pass: boolean; reason?: string }> {
    // 基础风控规则
    const { amount, ip } = orderInfo;

    // 单笔金额限制（单位：元）
    const maxSingleAmount = 100000; // 10万
    if (amount > maxSingleAmount) {
      return { pass: false, reason: '单笔金额超过限制' };
    }

    // 24小时内累计金额限制
    // TODO: 实现Redis缓存查询
    const maxDailyAmount = 500000; // 50万
    // const dailyTotal = await this.getDailyTotalAmount(orderInfo.userId);
    // if (dailyTotal + amount > maxDailyAmount) {
    //   return { pass: false, reason: '日累计金额超过限制' };
    // }

    // IP频率限制
    // TODO: 实现IP频率限制
    // const ipCount = await this.getIpOrderCount(ip);
    // if (ipCount > 100) {
    //   return { pass: false, reason: 'IP请求过于频繁' };
    // }

    // 可疑金额检测
    if (amount > 50000 && !orderInfo.deviceId) {
      this.logger.warn(`大额订单 ${orderInfo.userId} 金额 ${amount} 元缺少设备标识`);
    }

    return { pass: true };
  }

  /**
   * 加密敏感数据
   */
  encryptSensitiveData(data: string, publicKey: string): string {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(data)
    );
    return encrypted.toString('base64');
  }

  /**
   * 解密敏感数据
   */
  decryptSensitiveData(encryptedData: string, privateKey: string): string {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedData, 'base64')
    );
    return decrypted.toString('utf8');
  }

  /**
   * 生成退款单号
   */
  generateRefundNo(prefix: string = 'REFUND'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 记录支付日志
   */
  logPayment(operation: string, params: any, result: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      params: this.maskSensitiveData(params),
      result,
    };
    this.logger.log(`支付操作: ${JSON.stringify(logEntry)}`);
  }

  /**
   * 屏蔽敏感数据
   */
  private maskSensitiveData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'secret', 'token', 'privateKey', 'alipayPublicKey'];
    const masked = { ...data };
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        const value = masked[field];
        if (typeof value === 'string' && value.length > 8) {
          masked[field] = value.substring(0, 4) + '****' + value.substring(value.length - 4);
        }
      }
    }
    
    return masked;
  }
}
