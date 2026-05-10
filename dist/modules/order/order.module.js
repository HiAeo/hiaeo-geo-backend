"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./entities/order.entity");
const payment_entity_1 = require("./entities/payment.entity");
const coupon_entity_1 = require("./entities/coupon.entity");
const order_service_1 = require("./services/order.service");
const payment_service_1 = require("./services/payment.service");
const coupon_service_1 = require("./services/coupon.service");
const order_controller_1 = require("./controllers/order.controller");
const package_module_1 = require("../package/package.module");
const subscription_module_1 = require("../subscription/subscription.module");
const invitation_module_1 = require("../invitation/invitation.module");
let OrderModule = class OrderModule {
};
exports.OrderModule = OrderModule;
exports.OrderModule = OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, payment_entity_1.Payment, payment_entity_1.Refund, coupon_entity_1.Coupon, coupon_entity_1.UserCoupon]),
            package_module_1.PackageModule,
            subscription_module_1.SubscriptionModule,
            invitation_module_1.InvitationModule,
        ],
        controllers: [order_controller_1.OrderController],
        providers: [order_service_1.OrderService, payment_service_1.PaymentService, coupon_service_1.CouponService],
        exports: [order_service_1.OrderService, payment_service_1.PaymentService, coupon_service_1.CouponService],
    })
], OrderModule);
//# sourceMappingURL=order.module.js.map