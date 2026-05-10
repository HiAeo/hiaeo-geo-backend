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
var PaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../order/entities/order.entity");
const payment_entity_1 = require("../order/entities/payment.entity");
const order_service_1 = require("../order/services/order.service");
const alipay_provider_1 = require("./providers/alipay.provider");
const wechat_provider_1 = require("./providers/wechat.provider");
const payment_security_service_1 = require("./security/payment-security.service");
const payment_config_service_1 = require("./providers/payment-config.service");
let PaymentController = PaymentController_1 = class PaymentController {
    constructor(orderService, alipayProvider, wechatProvider, securityService, configService, orderRepository, paymentRepository) {
        this.orderService = orderService;
        this.alipayProvider = alipayProvider;
        this.wechatProvider = wechatProvider;
        this.securityService = securityService;
        this.configService = configService;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.logger = new common_1.Logger(PaymentController_1.name);
    }
    async createPayment(body, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('用户未登录');
        }
        const order = await this.orderRepository.findOne({
            where: { id: body.orderId, userId }
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException('订单状态不允许支付');
        }
        const riskResult = await this.securityService.riskCheck({
            userId,
            amount: Number(order.amount),
            ip: body.clientIp || req.ip || '127.0.0.1',
        });
        if (!riskResult.pass) {
            throw new common_1.BadRequestException(`支付被拦截: ${riskResult.reason}`);
        }
        const paymentMethod = body.paymentMethod || 'alipay';
        const payment = await this.orderService.createPayment(body.orderId, paymentMethod);
        const result = await this.initiatePayment(order, payment, body.paymentMethod);
        this.securityService.logPayment('create_payment', {
            orderId: body.orderId,
            paymentMethod: body.paymentMethod,
            paymentNo: payment.paymentNo,
        }, result);
        return result;
    }
    async queryPayment(paymentNo) {
        const payment = await this.paymentRepository.findOne({
            where: { paymentNo },
        });
        if (!payment) {
            throw new common_1.NotFoundException('支付记录不存在');
        }
        let queryResult;
        if (payment.paymentMethod === order_entity_1.PaymentMethod.ALIPAY) {
            queryResult = await this.alipayProvider.queryOrder(paymentNo);
        }
        else if (payment.paymentMethod === order_entity_1.PaymentMethod.WECHAT) {
            queryResult = await this.wechatProvider.queryOrder(paymentNo);
        }
        else {
            return {
                success: true,
                tradeStatus: payment.status,
                paymentNo,
            };
        }
        return {
            success: queryResult.success,
            tradeStatus: payment.status,
            tradeState: queryResult.tradeStatus,
            paymentNo,
            tradeNo: queryResult.tradeNo,
        };
    }
    async applyRefund(body, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('用户未登录');
        }
        const result = await this.orderService.refundOrder(body.orderId, userId, body.reason || '用户申请退款');
        return result;
    }
    async alipayCallback(postData) {
        this.logger.log(`收到支付宝回调: ${JSON.stringify(postData)}`);
        const result = await this.alipayProvider.processNotify(postData);
        if (result.success) {
            const paymentNo = postData.out_trade_no;
            await this.handlePaymentSuccess(paymentNo, {
                transactionId: postData.trade_no,
                paidAmount: parseFloat(postData.total_amount || '0'),
                paidAt: new Date(),
            });
        }
        return result.message;
    }
    async wechatCallback(body, headers) {
        this.logger.log(`收到微信支付回调`);
        const result = await this.wechatProvider.processNotify({
            headers: {
                'wechatpay-signature': headers['wechatpay-signature'],
                'wechatpay-timestamp': headers['wechatpay-timestamp'],
                'wechatpay-nonce': headers['wechatpay-nonce'],
                'wechatpay-serial': headers['wechatpay-serial'],
            },
            body: typeof body === 'string' ? body : JSON.stringify(body),
        });
        if (result.success) {
            let transactionId = '';
            let outTradeNo = '';
            let totalAmount = 0;
            try {
                const data = typeof body === 'string' ? JSON.parse(body) : body;
                transactionId = data?.resource?.transaction_id || data?.transaction_id;
                outTradeNo = data?.resource?.out_trade_no || data?.out_trade_no;
                totalAmount = data?.resource?.amount?.total || 0;
            }
            catch { }
            if (outTradeNo) {
                await this.handlePaymentSuccess(outTradeNo, {
                    transactionId,
                    paidAmount: totalAmount,
                    paidAt: new Date(),
                });
            }
        }
        return result.success
            ? { code: 'SUCCESS', message: '成功' }
            : { code: 'FAIL', message: result.message };
    }
    getAvailableChannels() {
        return {
            channels: [
                { code: 'alipay', name: '支付宝', icon: 'alipay' },
                { code: 'wechat', name: '微信支付', icon: 'wechat' },
            ],
        };
    }
    async getPaymentStatus(paymentNo) {
        const payment = await this.paymentRepository.findOne({
            where: { paymentNo },
        });
        if (!payment) {
            throw new common_1.NotFoundException('支付记录不存在');
        }
        return {
            paymentNo: payment.paymentNo,
            status: payment.status,
            amount: payment.totalAmount,
            paidAmount: payment.paidAmount,
            paidAt: payment.paidAt,
        };
    }
    async initiatePayment(order, payment, paymentMethod) {
        if (paymentMethod === order_entity_1.PaymentMethod.ALIPAY) {
            const result = await this.alipayProvider.qrCodePay({
                outTradeNo: payment.paymentNo,
                totalAmount: Number(order.amount),
                subject: order.packageName,
            });
            return {
                success: result.success,
                qrCode: result.qrCode,
                paymentNo: result.outTradeNo,
                tradeNo: result.tradeNo,
                errorMessage: result.errorMessage,
            };
        }
        else if (paymentMethod === order_entity_1.PaymentMethod.WECHAT) {
            const totalAmountFen = this.securityService.yuanToFen(Number(order.amount));
            const result = await this.wechatProvider.unifiedOrder({
                outTradeNo: payment.paymentNo,
                totalAmount: totalAmountFen,
                subject: order.packageName,
            });
            return {
                success: result.success,
                qrCode: result.codeUrl,
                paymentNo: result.outTradeNo,
                tradeNo: result.tradeNo,
                errorMessage: result.errorMessage,
            };
        }
        return {
            success: false,
            errorMessage: '不支持的支付方式',
        };
    }
    async handlePaymentSuccess(paymentNo, data) {
        const payment = await this.paymentRepository.findOne({
            where: { paymentNo },
            relations: ['order'],
        });
        if (!payment) {
            this.logger.warn(`支付记录不存在: ${paymentNo}`);
            return;
        }
        if (payment.status === payment_entity_1.PaymentStatus.SUCCESS) {
            return;
        }
        await this.paymentRepository.update(paymentNo, {
            status: payment_entity_1.PaymentStatus.SUCCESS,
            channelTransactionId: data.transactionId,
            paidAmount: data.paidAmount,
            paidAt: data.paidAt,
        });
        await this.orderService.completeOrder(payment.orderId, {
            orderId: payment.orderId,
            paymentNo,
            status: 'success',
            transactionId: data.transactionId,
            paidAmount: data.paidAmount,
            paidAt: data.paidAt.toISOString(),
        });
        this.logger.log(`支付成功: ${paymentNo}, 交易号: ${data.transactionId}`);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: '发起支付' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)('query/:paymentNo'),
    (0, swagger_1.ApiOperation)({ summary: '查询支付状态' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('paymentNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "queryPayment", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, swagger_1.ApiOperation)({ summary: '申请退款' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "applyRefund", null);
__decorate([
    (0, common_1.Post)('callback/alipay'),
    (0, swagger_1.ApiOperation)({ summary: '支付宝回调' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "alipayCallback", null);
__decorate([
    (0, common_1.Post)('callback/wechat'),
    (0, swagger_1.ApiOperation)({ summary: '微信支付回调' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "wechatCallback", null);
__decorate([
    (0, common_1.Get)('channels'),
    (0, swagger_1.ApiOperation)({ summary: '获取可用支付渠道' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getAvailableChannels", null);
__decorate([
    (0, common_1.Get)('status/:paymentNo'),
    (0, swagger_1.ApiOperation)({ summary: '获取支付状态' }),
    __param(0, (0, common_1.Param)('paymentNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentStatus", null);
exports.PaymentController = PaymentController = PaymentController_1 = __decorate([
    (0, swagger_1.ApiTags)('支付'),
    (0, common_1.Controller)('v1/payments'),
    __param(5, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(6, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        alipay_provider_1.AlipayProvider,
        wechat_provider_1.WechatProvider,
        payment_security_service_1.PaymentSecurityService,
        payment_config_service_1.PaymentConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map