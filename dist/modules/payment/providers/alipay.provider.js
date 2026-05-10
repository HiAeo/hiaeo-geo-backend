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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AlipayProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlipayProvider = void 0;
const common_1 = require("@nestjs/common");
const payment_config_service_1 = require("./payment-config.service");
const payment_security_service_1 = require("../security/payment-security.service");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
let AlipayProvider = AlipayProvider_1 = class AlipayProvider {
    constructor(configService, securityService) {
        this.configService = configService;
        this.securityService = securityService;
        this.logger = new common_1.Logger(AlipayProvider_1.name);
    }
    async qrCodePay(params) {
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
            const bizContent = {
                out_trade_no: params.outTradeNo,
                total_amount: params.totalAmount.toFixed(2),
                subject: params.subject,
                product_code: 'FAST_INSTANT_TRADE_PAY',
                timeout_express: '30m',
            };
            const sign = this.generateAlipaySign(bizContent, config);
            const response = await axios_1.default.post(`${config.sandbox ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do' : 'https://openapi.alipay.com/gateway.do'}`, {
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
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
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
        }
        catch (error) {
            this.logger.error(`支付宝收款失败: ${error.message}`);
            return {
                success: false,
                errorMessage: error.message,
            };
        }
    }
    async unifiedOrder(params) {
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
            const response = await axios_1.default.post(`${config.sandbox ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do' : 'https://openapi.alipay.com/gateway.do'}`, {
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
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
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
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message,
            };
        }
    }
    async queryOrder(outTradeNo) {
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
            const response = await axios_1.default.post(`${config.sandbox ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do' : 'https://openapi.alipay.com/gateway.do'}`, {
                app_id: config.appId,
                method: 'alipay.trade.query',
                format: 'JSON',
                charset: 'utf-8',
                sign_type: 'RSA2',
                timestamp: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
                version: '1.0',
                biz_content: JSON.stringify(bizContent),
                sign,
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
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
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message,
            };
        }
    }
    async refund(params) {
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
    verifyNotify(postData) {
        try {
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
        }
        catch (error) {
            this.logger.error(`支付宝回调验证异常: ${error.message}`);
            return { valid: false };
        }
    }
    async processNotify(postData) {
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
    generateAlipaySign(bizContent, config) {
        const params = {
            app_id: config.appId,
            method: 'alipay.trade.precreate',
            format: 'JSON',
            charset: 'utf-8',
            sign_type: 'RSA2',
            timestamp: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
            version: '1.0',
            biz_content: JSON.stringify(bizContent),
        };
        const sortedKeys = Object.keys(params).sort();
        const pairs = [];
        for (const key of sortedKeys) {
            if (params[key]) {
                pairs.push(`${key}=${params[key]}`);
            }
        }
        const signStr = pairs.join('&');
        const sign = crypto
            .createSign('RSA-SHA256')
            .update(signStr)
            .sign(config.privateKey, 'base64');
        return sign;
    }
    verifySign(data) {
        const config = this.configService.getAlipayConfig();
        if (!config)
            return false;
        const { sign, ...dataWithoutSign } = data;
        if (!sign)
            return false;
        const sortedKeys = Object.keys(dataWithoutSign).sort();
        const pairs = [];
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
        }
        catch {
            return false;
        }
    }
};
exports.AlipayProvider = AlipayProvider;
exports.AlipayProvider = AlipayProvider = AlipayProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_config_service_1.PaymentConfigService,
        payment_security_service_1.PaymentSecurityService])
], AlipayProvider);
//# sourceMappingURL=alipay.provider.js.map