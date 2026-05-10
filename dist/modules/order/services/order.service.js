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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const payment_entity_1 = require("../entities/payment.entity");
const payment_entity_2 = require("../entities/payment.entity");
const package_service_1 = require("../../package/services/package.service");
const subscription_service_1 = require("../../subscription/services/subscription.service");
const credit_service_1 = require("../../subscription/services/credit.service");
const credit_entity_1 = require("../../subscription/entities/credit.entity");
const invitation_service_1 = require("../../invitation/services/invitation.service");
let OrderService = class OrderService {
    constructor(orderRepository, paymentRepository, refundRepository, packageService, subscriptionService, creditService, invitationService, dataSource) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.refundRepository = refundRepository;
        this.packageService = packageService;
        this.subscriptionService = subscriptionService;
        this.creditService = creditService;
        this.invitationService = invitationService;
        this.dataSource = dataSource;
    }
    async createOrder(userId, dto) {
        const orderNo = this.generateOrderNo();
        if (dto.packageId) {
            const pkg = await this.packageService.getPackageById(dto.packageId);
            if (!pkg) {
                throw new common_1.NotFoundException('套餐不存在');
            }
        }
        let finalAmount = dto.amount;
        let discount = dto.discount || 0;
        if (dto.duration && dto.duration >= 12) {
            const yearlyDiscount = 0.2;
            discount += finalAmount * yearlyDiscount;
            finalAmount = finalAmount * 0.8;
        }
        const order = this.orderRepository.create({
            orderNo,
            userId,
            packageId: dto.packageId,
            packageName: dto.packageName,
            amount: finalAmount,
            originalAmount: dto.originalAmount || dto.amount,
            discount,
            status: order_entity_1.OrderStatus.PENDING,
            remark: dto.remark,
        });
        const savedOrder = await this.orderRepository.save(order);
        if (finalAmount === 0) {
            await this.completeOrder(savedOrder.id, {
                orderId: savedOrder.id,
                paymentNo: orderNo,
                status: 'success',
                transactionId: 'FREE' + Date.now(),
                paidAmount: 0,
                paidAt: new Date().toISOString(),
            });
        }
        return savedOrder;
    }
    async getOrders(filter) {
        const { userId, status, startDate, endDate, page = 1, limit = 10 } = filter;
        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .where('order.userId = :userId', { userId });
        if (status) {
            queryBuilder.andWhere('order.status = :status', { status });
        }
        if (startDate) {
            queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
        }
        const total = await queryBuilder.getCount();
        const orders = await queryBuilder
            .orderBy('order.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getOrderById(orderId, userId) {
        const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        const payments = await this.paymentRepository.find({ where: { orderId } });
        return {
            ...order,
            payments,
        };
    }
    async getOrderStats(userId) {
        const orders = await this.orderRepository.find({ where: { userId } });
        const totalOrders = orders.length;
        const paidOrders = orders.filter(o => o.status === order_entity_1.OrderStatus.PAID).length;
        const pendingOrders = orders.filter(o => o.status === order_entity_1.OrderStatus.PENDING).length;
        const totalSpent = orders
            .filter(o => o.status === order_entity_1.OrderStatus.PAID)
            .reduce((sum, o) => sum + Number(o.amount), 0);
        return {
            totalOrders,
            paidOrders,
            pendingOrders,
            totalSpent,
        };
    }
    async cancelOrder(orderId, userId, reason) {
        const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== order_entity_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('只有待支付的订单才能取消');
        }
        await this.orderRepository.update(orderId, {
            status: order_entity_1.OrderStatus.CANCELLED,
            remark: reason ? `${order.remark || ''} | 取消原因: ${reason}` : order.remark,
        });
        return this.orderRepository.findOne({ where: { id: orderId } });
    }
    async createPayment(orderId, paymentMethod) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.amount === 0) {
            throw new common_1.BadRequestException('免费订单无需支付');
        }
        const paymentNo = this.generatePaymentNo();
        const payment = this.paymentRepository.create({
            orderId,
            paymentNo,
            status: payment_entity_1.PaymentStatus.PENDING,
            totalAmount: order.amount,
            paidAmount: 0,
            paymentMethod,
            expireAt: new Date(Date.now() + 30 * 60 * 1000),
        });
        return this.paymentRepository.save(payment);
    }
    async getPaymentInfo(paymentId) {
        const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
        if (!payment) {
            throw new common_1.NotFoundException('支付记录不存在');
        }
        return payment;
    }
    async getPaymentByPaymentNo(paymentNo) {
        return this.paymentRepository.findOne({ where: { paymentNo } });
    }
    async completeOrder(orderId, callback) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, { where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException('订单不存在');
            }
            if (order.status === order_entity_1.OrderStatus.PAID) {
                throw new common_1.BadRequestException('订单已支付');
            }
            await queryRunner.manager.update(order_entity_1.Order, orderId, {
                status: order_entity_1.OrderStatus.PAID,
                paymentTime: callback.paidAt ? new Date(callback.paidAt) : new Date(),
                transactionId: callback.transactionId,
            });
            if (callback.paymentNo) {
                await queryRunner.manager.update(payment_entity_1.Payment, { paymentNo: callback.paymentNo }, {
                    status: payment_entity_1.PaymentStatus.SUCCESS,
                    paidAmount: callback.paidAmount || order.amount,
                    paidAt: callback.paidAt ? new Date(callback.paidAt) : new Date(),
                    channelTransactionId: callback.transactionId,
                    channelResponse: callback.channelResponse,
                });
            }
            if (order.packageId) {
                try {
                    await this.subscriptionService.createSubscription({
                        userId: order.userId,
                        packageId: order.packageId,
                    });
                    const credits = Math.floor(order.amount / 10);
                    if (credits > 0) {
                        await this.creditService.earnCredits({
                            userId: order.userId,
                            amount: credits,
                            sourceType: credit_entity_1.SourceType.SUBSCRIPTION,
                            description: `订阅${order.packageName}赠送积分`,
                            relatedOrderId: order.id,
                        });
                    }
                }
                catch (error) {
                    console.error('创建订阅失败:', error);
                }
            }
            try {
                await this.invitationService.completeInvitation(orderId, order.userId);
            }
            catch (error) {
                console.error('完成邀请奖励失败:', error);
            }
            await queryRunner.commitTransaction();
            return {
                orderId,
                status: 'success',
                message: '支付成功',
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async refundOrder(orderId, userId, reason) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, { where: { id: orderId, userId } });
            if (!order) {
                throw new common_1.NotFoundException('订单不存在');
            }
            if (order.status !== order_entity_1.OrderStatus.PAID) {
                throw new common_1.BadRequestException('只有已支付的订单才能退款');
            }
            const paidTime = new Date(order.paymentTime);
            const now = new Date();
            const daysDiff = (now.getTime() - paidTime.getTime()) / (1000 * 60 * 60 * 24);
            if (daysDiff > 7) {
                throw new common_1.BadRequestException('已超过7天退款期限');
            }
            const refundNo = this.generateRefundNo();
            const refund = queryRunner.manager.create(payment_entity_2.Refund, {
                orderId,
                paymentId: '',
                refundNo,
                refundAmount: order.amount,
                reason,
                status: 'pending',
            });
            await queryRunner.manager.save(refund);
            await queryRunner.manager.update(order_entity_1.Order, orderId, {
                status: order_entity_1.OrderStatus.REFUNDED,
            });
            const credits = Math.floor(Number(order.amount) / 10);
            if (credits > 0) {
                try {
                    await this.creditService.refundCredits(order.userId, credits, `退款-${order.packageName}`, orderId);
                }
                catch (error) {
                    console.error('积分退还失败:', error);
                }
            }
            await queryRunner.commitTransaction();
            return {
                refundNo,
                refundAmount: order.amount,
                status: 'pending',
                message: '退款申请已提交，将在1-3个工作日内处理',
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getRefunds(userId) {
        const orders = await this.orderRepository.find({ where: { userId, status: order_entity_1.OrderStatus.REFUNDED } });
        const orderIds = orders.map(o => o.id);
        return this.refundRepository.find({
            where: orderIds.map(id => ({ orderId: id })),
            order: { createdAt: 'DESC' },
        });
    }
    generateOrderNo() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `HIAEO${timestamp}${random}`;
    }
    generatePaymentNo() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `PAY${timestamp}${random}`;
    }
    generateRefundNo() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `REF${timestamp}${random}`;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_2.Refund)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        package_service_1.PackageService,
        subscription_service_1.SubscriptionService,
        credit_service_1.CreditService,
        invitation_service_1.InvitationService,
        typeorm_2.DataSource])
], OrderService);
//# sourceMappingURL=order.service.js.map