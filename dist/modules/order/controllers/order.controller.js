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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const order_service_1 = require("../services/order.service");
const payment_service_1 = require("../services/payment.service");
const coupon_service_1 = require("../services/coupon.service");
const order_entity_1 = require("../entities/order.entity");
class CreateOrderDto {
}
class RefundOrderDto {
}
class ValidateCouponDto {
}
let OrderController = class OrderController {
    constructor(orderService, paymentService, couponService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.couponService = couponService;
    }
    async getOrders(userId, status, page, limit) {
        return this.orderService.getOrders({
            userId,
            status: status,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
    }
    async getOrderStats(userId) {
        return this.orderService.getOrderStats(userId);
    }
    async getRefunds(userId) {
        return this.orderService.getRefunds(userId);
    }
    async getUserCoupons(userId) {
        return this.couponService.getUserCoupons(userId);
    }
    async getOrderById(userId, id) {
        return this.orderService.getOrderById(id, userId);
    }
    async createOrder(userId, dto) {
        if (dto.couponCode) {
            const couponResult = await this.couponService.validateCoupon(dto.couponCode, userId, dto.amount, dto.packageId);
            if (couponResult.valid) {
                dto.discount = couponResult.discount;
            }
        }
        return this.orderService.createOrder(userId, dto);
    }
    async cancelOrder(userId, id, reason) {
        return this.orderService.cancelOrder(id, userId, reason);
    }
    async refundOrder(userId, id, dto) {
        return this.orderService.refundOrder(id, userId, dto.reason);
    }
    async payOrder(userId, id, paymentMethod) {
        const payment = await this.orderService.createPayment(id, paymentMethod);
        const order = await this.orderService.getOrderById(id, userId);
        const notifyUrl = `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/orders/callback/${paymentMethod.toLowerCase()}`;
        if (paymentMethod === order_entity_1.PaymentMethod.ALIPAY) {
            const result = await this.paymentService.alipayUnifiedOrder({
                outTradeNo: payment.paymentNo,
                totalAmount: Number(order.amount),
                subject: order.packageName,
                body: `订单号: ${order.orderNo}`,
                notifyUrl,
                returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success?orderId=${id}`,
            });
            return { payment, ...result };
        }
        else if (paymentMethod === order_entity_1.PaymentMethod.WECHAT) {
            const result = await this.paymentService.wechatUnifiedOrder({
                outTradeNo: payment.paymentNo,
                totalAmount: Number(order.amount),
                subject: order.packageName,
                body: `订单号: ${order.orderNo}`,
                notifyUrl,
            });
            return { payment, ...result };
        }
        throw new Error('不支持的支付方式');
    }
    async validateCoupon(userId, dto) {
        return this.couponService.validateCoupon(dto.code, userId, dto.orderAmount, dto.packageId);
    }
    async alipayCallback(params) {
        const verified = this.paymentService.verifyAlipayNotify(params);
        if (verified) {
            await this.orderService.completeOrder(params.out_trade_no, {
                orderId: params.out_trade_no,
                paymentNo: params.trade_no,
                status: params.trade_status,
                transactionId: params.trade_no,
                paidAmount: params.total_amount,
                paidAt: params.gmt_payment,
                channelResponse: params,
            });
        }
        return { success: verified };
    }
    async wechatCallback(params) {
        const verified = this.paymentService.verifyWechatNotify(params);
        if (verified) {
            await this.orderService.completeOrder(params.out_trade_no, {
                orderId: params.out_trade_no,
                paymentNo: params.transaction_id,
                status: params.result_code,
                transactionId: params.transaction_id,
                paidAmount: params.total_fee / 100,
                paidAt: params.time_end,
                channelResponse: params,
            });
        }
        return { success: verified };
    }
    async getPaymentInfo(paymentId) {
        return this.orderService.getPaymentInfo(paymentId);
    }
    async queryPaymentStatus(id, paymentMethod) {
        const order = await this.orderService.getOrderById(id, 'system');
        if (paymentMethod === order_entity_1.PaymentMethod.ALIPAY) {
            return this.paymentService.queryAlipayOrder(order.orderNo);
        }
        else if (paymentMethod === order_entity_1.PaymentMethod.WECHAT) {
            return this.paymentService.queryWechatOrder(order.orderNo);
        }
        return { success: false, errorMessage: '不支持的支付方式' };
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取订单列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: order_entity_1.OrderStatus }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回订单列表' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取订单统计' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回订单统计' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderStats", null);
__decorate([
    (0, common_1.Get)('refunds'),
    (0, swagger_1.ApiOperation)({ summary: '获取退款记录' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回退款记录' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getRefunds", null);
__decorate([
    (0, common_1.Get)('coupons'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的优惠券' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回优惠券列表' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getUserCoupons", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取订单详情' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回订单详情' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建订单' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '订单创建成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消订单' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订单取消成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Put)(':id/refund'),
    (0, swagger_1.ApiOperation)({ summary: '申请退款' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '退款申请成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, RefundOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "refundOrder", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, swagger_1.ApiOperation)({ summary: '发起支付' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回支付信息' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('paymentMethod')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "payOrder", null);
__decorate([
    (0, common_1.Post)('coupon/validate'),
    (0, swagger_1.ApiOperation)({ summary: '验证优惠券' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回验证结果' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ValidateCouponDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "validateCoupon", null);
__decorate([
    (0, common_1.Post)('callback/alipay'),
    (0, swagger_1.ApiOperation)({ summary: '支付宝回调' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '回调处理成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "alipayCallback", null);
__decorate([
    (0, common_1.Post)('callback/wechat'),
    (0, swagger_1.ApiOperation)({ summary: '微信支付回调' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '回调处理成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "wechatCallback", null);
__decorate([
    (0, common_1.Get)('payment/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: '获取支付信息' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回支付信息' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getPaymentInfo", null);
__decorate([
    (0, common_1.Post)(':id/pay/query'),
    (0, swagger_1.ApiOperation)({ summary: '查询支付状态' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回支付状态' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('paymentMethod')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "queryPaymentStatus", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiTags)('订单管理'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        payment_service_1.PaymentService,
        coupon_service_1.CouponService])
], OrderController);
//# sourceMappingURL=order.controller.js.map