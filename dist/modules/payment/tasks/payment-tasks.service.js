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
var PaymentTaskService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTaskService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../../subscription/entities/subscription.entity");
const order_entity_1 = require("../../order/entities/order.entity");
const order_service_1 = require("../../order/services/order.service");
const credit_service_1 = require("../../subscription/services/credit.service");
const config_service_1 = require("../../../config/config.service");
const payment_security_service_1 = require("../security/payment-security.service");
let PaymentTaskService = PaymentTaskService_1 = class PaymentTaskService {
    constructor(subscriptionRepository, orderRepository, orderService, creditService, configService, securityService) {
        this.subscriptionRepository = subscriptionRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.creditService = creditService;
        this.configService = configService;
        this.securityService = securityService;
        this.logger = new common_1.Logger(PaymentTaskService_1.name);
    }
    onModuleInit() {
        this.logger.log('支付定时任务服务已启动');
    }
    async checkExpiringSubscriptions() {
        if (this.configService.isProduction() && this.configService.get('ENABLE_RENEWAL_TASK', 'true') !== 'true') {
            return;
        }
        this.logger.log('开始检查即将到期的订阅...');
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const expiringSubscriptions = await this.subscriptionRepository.find({
            where: {
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                endDate: (0, typeorm_2.Between)(now, sevenDaysLater),
            },
        });
        this.logger.log(`发现 ${expiringSubscriptions.length} 个即将到期的订阅`);
        for (const subscription of expiringSubscriptions) {
            try {
                await this.sendRenewalReminder(subscription);
            }
            catch (error) {
                this.logger.error(`发送续费提醒失败: ${error.message}`);
            }
        }
    }
    async processAutoRenewal() {
        if (this.configService.get('ENABLE_AUTO_RENEWAL', 'false') !== 'true') {
            return;
        }
        this.logger.log('开始处理自动续费...');
        const now = new Date();
        const expiringSubscriptions = await this.subscriptionRepository.find({
            where: {
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                endDate: (0, typeorm_2.LessThan)(now),
                autoRenew: true,
            },
        });
        this.logger.log(`发现 ${expiringSubscriptions.length} 个需要自动续费的订阅`);
        const results = [];
        for (const subscription of expiringSubscriptions) {
            try {
                const result = await this.processSubscriptionRenewal(subscription);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`自动续费失败: ${error.message}`);
                results.push({
                    subscriptionId: subscription.id,
                    userId: subscription.userId,
                    success: false,
                    message: error.message,
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        this.logger.log(`自动续费完成: 成功 ${successCount}/${results.length}`);
    }
    async closeExpiredOrders() {
        if (this.configService.get('ENABLE_ORDER_CLEANUP', 'true') !== 'true') {
            return;
        }
        this.logger.log('开始检查超时订单...');
        const now = new Date();
        const expireTime = new Date(now.getTime() - 30 * 60 * 1000);
        const expiredOrders = await this.orderRepository.find({
            where: {
                status: 'pending',
            },
        });
        const filteredOrders = expiredOrders.filter(order => {
            const createdAt = new Date(order.createdAt);
            return createdAt < expireTime;
        });
        this.logger.log(`发现 ${filteredOrders.length} 个超时订单`);
        for (const order of filteredOrders) {
            try {
                await this.orderService.cancelOrder(order.id, order.userId, '支付超时自动取消');
                this.logger.log(`已关闭超时订单: ${order.id}`);
            }
            catch (error) {
                this.logger.error(`关闭超时订单失败: ${error.message}`);
            }
        }
    }
    async processSubscriptionRenewal(subscription) {
        const userId = subscription.userId;
        const balance = await this.creditService.getBalance(userId);
        const requiredCredits = 100;
        if (balance < requiredCredits) {
            await this.sendInsufficientBalanceNotice(subscription);
            return {
                subscriptionId: subscription.id,
                userId,
                success: false,
                message: '余额不足，自动续费失败',
            };
        }
        const newEndDate = new Date(subscription.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        await this.subscriptionRepository.update(subscription.id, {
            endDate: newEndDate,
        });
        this.logger.log(`订阅 ${subscription.id} 自动续费成功`);
        return {
            subscriptionId: subscription.id,
            userId,
            success: true,
        };
    }
    async sendRenewalReminder(subscription) {
        const daysUntilExpiry = Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        this.logger.log(`发送续费提醒: 用户 ${subscription.userId}, ${daysUntilExpiry} 天后到期`);
    }
    async sendInsufficientBalanceNotice(subscription) {
        this.logger.log(`发送余额不足提醒: 用户 ${subscription.userId}`);
    }
};
exports.PaymentTaskService = PaymentTaskService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *', { name: 'checkExpiringSubscriptions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentTaskService.prototype, "checkExpiringSubscriptions", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *', { name: 'processAutoRenewal' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentTaskService.prototype, "processAutoRenewal", null);
__decorate([
    (0, schedule_1.Cron)('0 * * * *', { name: 'closeExpiredOrders' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentTaskService.prototype, "closeExpiredOrders", null);
exports.PaymentTaskService = PaymentTaskService = PaymentTaskService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        order_service_1.OrderService,
        credit_service_1.CreditService,
        config_service_1.ConfigService,
        payment_security_service_1.PaymentSecurityService])
], PaymentTaskService);
//# sourceMappingURL=payment-tasks.service.js.map