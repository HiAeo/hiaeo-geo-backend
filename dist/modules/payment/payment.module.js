"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const order_entity_1 = require("../order/entities/order.entity");
const payment_entity_1 = require("../order/entities/payment.entity");
const coupon_entity_1 = require("../order/entities/coupon.entity");
const subscription_entity_1 = require("../subscription/entities/subscription.entity");
const order_module_1 = require("../order/order.module");
const subscription_module_1 = require("../subscription/subscription.module");
const payment_controller_1 = require("./payment.controller");
const payment_config_service_1 = require("./providers/payment-config.service");
const payment_security_service_1 = require("./security/payment-security.service");
const alipay_provider_1 = require("./providers/alipay.provider");
const wechat_provider_1 = require("./providers/wechat.provider");
const payment_tasks_service_1 = require("./tasks/payment-tasks.service");
const promotion_service_1 = require("./promotion/promotion.service");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.Order,
                payment_entity_1.Payment,
                coupon_entity_1.Coupon,
                coupon_entity_1.UserCoupon,
                subscription_entity_1.Subscription,
            ]),
            schedule_1.ScheduleModule.forRoot(),
            order_module_1.OrderModule,
            subscription_module_1.SubscriptionModule,
        ],
        controllers: [payment_controller_1.PaymentController],
        providers: [
            payment_config_service_1.PaymentConfigService,
            payment_security_service_1.PaymentSecurityService,
            alipay_provider_1.AlipayProvider,
            wechat_provider_1.WechatProvider,
            payment_tasks_service_1.PaymentTaskService,
            promotion_service_1.PromotionService,
        ],
        exports: [
            payment_config_service_1.PaymentConfigService,
            payment_security_service_1.PaymentSecurityService,
            alipay_provider_1.AlipayProvider,
            wechat_provider_1.WechatProvider,
            promotion_service_1.PromotionService,
        ],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map