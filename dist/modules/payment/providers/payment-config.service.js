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
var PaymentConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../config/config.service");
let PaymentConfigService = PaymentConfigService_1 = class PaymentConfigService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentConfigService_1.name);
    }
    isAlipayConfigured() {
        const appId = this.configService.get('ALIPAY_APP_ID', '');
        const privateKey = this.configService.get('ALIPAY_PRIVATE_KEY', '');
        const alipayPublicKey = this.configService.get('ALIPAY_PUBLIC_KEY', '');
        return !!(appId && privateKey && alipayPublicKey);
    }
    isWechatConfigured() {
        const mchId = this.configService.get('WECHAT_MCH_ID', '');
        const serialNo = this.configService.get('WECHAT_SERIAL_NO', '');
        const privateKey = this.configService.get('WECHAT_PRIVATE_KEY', '');
        return !!(mchId && serialNo && privateKey);
    }
    getAlipayConfig() {
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
    getWechatConfig() {
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
    getNotifyUrl(type) {
        const baseUrl = this.configService.get('API_BASE_URL', 'http://localhost:3000');
        return `${baseUrl}/api/payments/callback/${type}`;
    }
    isProduction() {
        return this.configService.isProduction();
    }
    isMockPayment() {
        if (this.isProduction()) {
            return this.configService.get('MOCK_PAYMENT', 'false') === 'true';
        }
        return this.configService.get('MOCK_PAYMENT', 'true') === 'true';
    }
    getPaymentSecret() {
        return this.configService.get('PAYMENT_SECRET_KEY', 'default-secret');
    }
    getWechatAppId() {
        return this.configService.get('WECHAT_APP_ID', '');
    }
};
exports.PaymentConfigService = PaymentConfigService;
exports.PaymentConfigService = PaymentConfigService = PaymentConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], PaymentConfigService);
//# sourceMappingURL=payment-config.service.js.map