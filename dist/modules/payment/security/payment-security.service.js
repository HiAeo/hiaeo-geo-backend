"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var PaymentSecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSecurityService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let PaymentSecurityService = PaymentSecurityService_1 = class PaymentSecurityService {
    constructor() {
        this.logger = new common_1.Logger(PaymentSecurityService_1.name);
    }
    generateOutTradeNo(prefix = 'HIAEO') {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }
    generateNonceStr(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    validateAmount(amount) {
        if (amount <= 0)
            return false;
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
    }
    yuanToFen(yuan) {
        return Math.round(yuan * 100);
    }
    fenToYuan(fen) {
        return fen / 100;
    }
    calculateOrderSignature(orderId, amount, secret) {
        const data = `${orderId}:${amount}:${secret}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    verifyOrderSignature(orderId, amount, signature, secret) {
        const expectedSignature = this.calculateOrderSignature(orderId, amount, secret);
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    verifyAlipaySign(signData, sign, publicKey) {
        try {
            const signType = signData.sign_type || 'RSA2';
            const signTypeUpper = signType.toUpperCase();
            const { sign_type, ...data } = signData;
            const sortedKeys = Object.keys(data).sort();
            const pairs = [];
            for (const key of sortedKeys) {
                if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                    pairs.push(`${key}=${data[key]}`);
                }
            }
            const signStr = pairs.join('&');
            const verifier = crypto.createVerify(signTypeUpper === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1');
            verifier.update(signStr);
            return verifier.verify(publicKey, sign, 'base64');
        }
        catch (error) {
            this.logger.error(`支付宝签名验证失败: ${error.message}`);
            return false;
        }
    }
    async verifyWechatSign(signature, timestamp, nonce, body, certificate) {
        try {
            const signStr = `${timestamp}\n${nonce}\n${body}\n`;
            const verifier = crypto.createVerify('RSA-SHA256');
            verifier.update(signStr);
            return verifier.verify(certificate, signature, 'base64');
        }
        catch (error) {
            this.logger.error(`微信支付签名验证失败: ${error.message}`);
            return false;
        }
    }
    async signWechatRequest(method, url, timestamp, nonce, body, privateKey) {
        const signStr = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(signStr);
        return sign.sign(privateKey, 'base64');
    }
    async riskCheck(orderInfo) {
        const { amount, ip } = orderInfo;
        const maxSingleAmount = 100000;
        if (amount > maxSingleAmount) {
            return { pass: false, reason: '单笔金额超过限制' };
        }
        const maxDailyAmount = 500000;
        if (amount > 50000 && !orderInfo.deviceId) {
            this.logger.warn(`大额订单 ${orderInfo.userId} 金额 ${amount} 元缺少设备标识`);
        }
        return { pass: true };
    }
    encryptSensitiveData(data, publicKey) {
        const encrypted = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, Buffer.from(data));
        return encrypted.toString('base64');
    }
    decryptSensitiveData(encryptedData, privateKey) {
        const decrypted = crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, Buffer.from(encryptedData, 'base64'));
        return decrypted.toString('utf8');
    }
    generateRefundNo(prefix = 'REFUND') {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }
    logPayment(operation, params, result) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            operation,
            params: this.maskSensitiveData(params),
            result,
        };
        this.logger.log(`支付操作: ${JSON.stringify(logEntry)}`);
    }
    maskSensitiveData(data) {
        if (!data)
            return data;
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
};
exports.PaymentSecurityService = PaymentSecurityService;
exports.PaymentSecurityService = PaymentSecurityService = PaymentSecurityService_1 = __decorate([
    (0, common_1.Injectable)()
], PaymentSecurityService);
//# sourceMappingURL=payment-security.service.js.map