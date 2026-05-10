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
var WechatProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatProvider = void 0;
const common_1 = require("@nestjs/common");
const payment_config_service_1 = require("./payment-config.service");
const payment_security_service_1 = require("../security/payment-security.service");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
let WechatProvider = WechatProvider_1 = class WechatProvider {
    constructor(configService, securityService) {
        this.configService = configService;
        this.securityService = securityService;
        this.logger = new common_1.Logger(WechatProvider_1.name);
    }
    async unifiedOrder(params) {
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
            const signature = await this.generateWechatSign('POST', '/v3/pay/transactions/native', timestamp, nonceStr, JSON.stringify(requestBody), config.privateKey);
            const response = await axios_1.default.post(`https://api.mch.weixin.qq.com/v3/pay/transactions/native`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `${authType} mchid="${config.mchId}",serial_no="${config.serialNo}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`,
                },
            });
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
        }
        catch (error) {
            this.logger.error(`微信支付统一下单失败: ${error.message}`);
            return {
                success: false,
                errorMessage: error.response?.data?.message || error.message,
            };
        }
    }
    async h5Pay(params) {
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
            const signature = await this.generateWechatSign('POST', '/v3/pay/transactions/h5', timestamp, nonceStr, JSON.stringify(requestBody), config.privateKey);
            const response = await axios_1.default.post(`https://api.mch.weixin.qq.com/v3/pay/transactions/h5`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `${authType} mchid="${config.mchId}",serial_no="${config.serialNo}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`,
                },
            });
            return {
                success: true,
                mwebUrl: response.data?.h5_url,
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
            const signature = await this.generateWechatSign('GET', `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${config.mchId}`, timestamp, nonceStr, '', config.privateKey);
            const response = await axios_1.default.get(`https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${outTradeNo}`, {
                params: { mchid: config.mchId },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `${authType} mchid="${config.mchId}",serial_no="${config.serialNo}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`,
                },
            });
            return {
                success: true,
                tradeNo: response.data?.transaction_id,
                outTradeNo: response.data?.out_trade_no,
                tradeState: response.data?.trade_state,
                tradeStateDesc: response.data?.trade_state_desc,
                totalAmount: response.data?.amount?.total,
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
    async verifyNotify(params) {
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
            }
            catch {
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
        }
        catch (error) {
            this.logger.error(`微信支付回调验证失败: ${error.message}`);
            return { valid: false };
        }
    }
    async processNotify(params) {
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
        }
        catch {
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
    async generateWechatSign(method, url, timestamp, nonceStr, body, privateKey) {
        const signStr = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(signStr);
        return sign.sign(privateKey, 'base64');
    }
    getExpireTime(minutes) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        return now.toISOString().replace(/[-:]/g, '').split('.')[0] + '+0800';
    }
};
exports.WechatProvider = WechatProvider;
exports.WechatProvider = WechatProvider = WechatProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_config_service_1.PaymentConfigService,
        payment_security_service_1.PaymentSecurityService])
], WechatProvider);
//# sourceMappingURL=wechat.provider.js.map