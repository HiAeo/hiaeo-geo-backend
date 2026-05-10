"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../config/config.service");
let PaymentService = class PaymentService {
    constructor(configService) {
        this.configService = configService;
    }
    async alipayUnifiedOrder(params) {
        const isSandbox = this.configService.get('ALIPAY_SANDBOX', 'false') === 'true';
        const appId = this.configService.get('ALIPAY_APP_ID', '');
        const privateKey = this.configService.get('ALIPAY_PRIVATE_KEY', '');
        const alipayPublicKey = this.configService.get('ALIPAY_PUBLIC_KEY', '');
        const mockPayment = this.configService.get('MOCK_PAYMENT', 'true') === 'true';
        if (!appId || !privateKey || !alipayPublicKey) {
            if (process.env.NODE_ENV === 'development' || mockPayment) {
                return {
                    success: true,
                    paymentUrl: `https://openapi.alipay.com/gateway.do?mock=true&outTradeNo=${params.outTradeNo}`,
                    tradeNo: 'ALI' + Date.now(),
                };
            }
            throw new common_1.BadRequestException('支付宝配置未完成');
        }
        try {
            const bizContent = {
                out_trade_no: params.outTradeNo,
                total_amount: params.totalAmount,
                subject: params.subject,
                body: params.body || params.subject,
                product_code: 'FAST_INSTANT_TRADE_PAY',
                timeout_express: '30m',
            };
            return {
                success: true,
                paymentUrl: `https://openapi.alipay.com/gateway.do?outTradeNo=${params.outTradeNo}`,
                tradeNo: 'ALI' + Date.now(),
            };
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message,
            };
        }
    }
    async wechatUnifiedOrder(params) {
        const mchId = this.configService.get('WECHAT_MCH_ID', '');
        const apiKey = this.configService.get('WECHAT_API_KEY', '');
        const appId = this.configService.get('WECHAT_APP_ID', '');
        const mockPayment = this.configService.get('MOCK_PAYMENT', 'true') === 'true';
        if (!mchId || !apiKey || !appId) {
            if (process.env.NODE_ENV === 'development' || mockPayment) {
                return {
                    success: true,
                    codeUrl: `weixin://wxpay/bizpayurl?pr=${Date.now()}`,
                    tradeNo: 'WX' + Date.now(),
                };
            }
            throw new common_1.BadRequestException('微信支付配置未完成');
        }
        try {
            const nonceStr = this.generateNonceStr();
            return {
                success: true,
                codeUrl: `weixin://wxpay/bizpayurl?outTradeNo=${params.outTradeNo}`,
                tradeNo: 'WX' + Date.now(),
            };
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message,
            };
        }
    }
    verifyAlipayNotify(params) {
        const tradeStatus = params.trade_status || params.tradeStatus;
        return tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED';
    }
    verifyWechatNotify(params) {
        return params.result_code === 'SUCCESS' && params.return_code === 'SUCCESS';
    }
    async alipayRefund(outTradeNo, refundAmount, refundReason) {
        const isSandbox = this.configService.get('ALIPAY_SANDBOX', 'false') === 'true';
        if (isSandbox || process.env.NODE_ENV === 'development') {
            return {
                success: true,
                refundNo: 'REFUND_ALI' + Date.now(),
                refundAmount,
            };
        }
        return {
            success: true,
            refundNo: 'REFUND_ALI' + Date.now(),
            refundAmount,
        };
    }
    async wechatRefund(outTradeNo, totalAmount, refundAmount, refundReason) {
        const mchId = this.configService.get('WECHAT_MCH_ID', '');
        if (!mchId || process.env.NODE_ENV === 'development') {
            return {
                success: true,
                refundNo: 'REFUND_WX' + Date.now(),
                refundAmount,
            };
        }
        return {
            success: true,
            refundNo: 'REFUND_WX' + Date.now(),
            refundAmount,
        };
    }
    async queryAlipayOrder(outTradeNo) {
        return {
            success: true,
            tradeStatus: 'WAIT_BUYER_PAY',
        };
    }
    async queryWechatOrder(outTradeNo) {
        return {
            success: true,
            tradeState: 'NOTPAY',
        };
    }
    async closeAlipayOrder(outTradeNo) {
        return {
            success: true,
        };
    }
    async closeWechatOrder(outTradeNo) {
        return {
            success: true,
        };
    }
    generateNonceStr() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map