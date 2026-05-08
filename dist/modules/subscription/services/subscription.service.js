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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../entities/subscription.entity");
const package_service_1 = require("../../package/services/package.service");
const package_entity_1 = require("../../package/entities/package.entity");
let SubscriptionService = class SubscriptionService {
    constructor(subscriptionRepository, packageService) {
        this.subscriptionRepository = subscriptionRepository;
        this.packageService = packageService;
    }
    async getCurrentSubscription(userId) {
        return this.subscriptionRepository.findOne({
            where: { userId, status: subscription_entity_1.SubscriptionStatus.ACTIVE },
            order: { endDate: 'DESC' },
        });
    }
    async getSubscriptionHistory(userId) {
        return this.subscriptionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async createSubscription(dto) {
        const pkg = await this.packageService.getPackageById(dto.packageId);
        if (!pkg) {
            throw new common_1.NotFoundException('套餐不存在');
        }
        const existing = await this.getCurrentSubscription(dto.userId);
        if (existing) {
            throw new common_1.BadRequestException('用户已有活跃订阅，请先取消当前订阅');
        }
        const now = new Date();
        let endDate;
        switch (pkg.billingCycle) {
            case package_entity_1.BillingCycle.MONTHLY:
                endDate = new Date(now.setMonth(now.getMonth() + 1));
                break;
            case package_entity_1.BillingCycle.QUARTERLY:
                endDate = new Date(now.setMonth(now.getMonth() + 3));
                break;
            case package_entity_1.BillingCycle.YEARLY:
                endDate = new Date(now.setFullYear(now.getFullYear() + 1));
                break;
            default:
                endDate = new Date(now.setMonth(now.getMonth() + 1));
        }
        const subscription = this.subscriptionRepository.create({
            userId: dto.userId,
            packageId: pkg.id,
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            startDate: new Date(),
            endDate,
            diagnosisUsed: 0,
            diagnosisLimit: pkg.diagnosisLimit,
            autoRenew: true,
        });
        const saved = await this.subscriptionRepository.save(subscription);
        const creditsEarned = Math.floor(pkg.price / 10);
        return {
            subscription: saved,
            creditsEarned,
            message: `订阅成功！您的${pkg.displayName}订阅已生效，到期时间为${endDate.toLocaleDateString('zh-CN')}`,
        };
    }
    async upgradeSubscription(userId, newPackageId) {
        const currentSub = await this.getCurrentSubscription(userId);
        if (!currentSub) {
            throw new common_1.BadRequestException('用户暂无订阅');
        }
        const currentPkg = await this.packageService.getPackageById(currentSub.packageId);
        const newPkg = await this.packageService.getPackageById(newPackageId);
        if (!newPkg) {
            throw new common_1.NotFoundException('目标套餐不存在');
        }
        const totalDays = Math.ceil((currentSub.endDate.getTime() - currentSub.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const usedDays = Math.ceil((new Date().getTime() - currentSub.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const remainingRatio = Math.max(0, (totalDays - usedDays) / totalDays);
        const refundValue = currentPkg ? currentPkg.price * remainingRatio : 0;
        const finalPrice = Math.max(0, newPkg.price - refundValue);
        await this.cancelSubscription(currentSub.id, 'upgrade');
        const result = await this.createSubscription({ userId, packageId: newPackageId });
        return {
            ...result,
            message: `升级成功！从${currentPkg?.name || '免费版'}升级到${newPkg.name}，已抵扣${Math.round(refundValue)}元`,
        };
    }
    async renewSubscription(userId) {
        const currentSub = await this.getCurrentSubscription(userId);
        if (!currentSub) {
            throw new common_1.BadRequestException('用户暂无订阅');
        }
        const pkg = await this.packageService.getPackageById(currentSub.packageId);
        if (!pkg) {
            throw new common_1.NotFoundException('订阅套餐不存在');
        }
        let newEndDate = new Date(currentSub.endDate);
        switch (pkg.billingCycle) {
            case package_entity_1.BillingCycle.MONTHLY:
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                break;
            case package_entity_1.BillingCycle.QUARTERLY:
                newEndDate.setMonth(newEndDate.getMonth() + 3);
                break;
            case package_entity_1.BillingCycle.YEARLY:
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                break;
        }
        await this.subscriptionRepository.update(currentSub.id, {
            endDate: newEndDate,
            diagnosisUsed: 0,
        });
        const updated = await this.subscriptionRepository.findOne({ where: { id: currentSub.id } });
        const creditsEarned = Math.floor(pkg.price / 10);
        return {
            subscription: updated,
            creditsEarned,
            message: `续费成功！您的订阅已延长至${newEndDate.toLocaleDateString('zh-CN')}`,
        };
    }
    async cancelSubscription(subscriptionId, reason) {
        const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        if (subscription.status !== subscription_entity_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.BadRequestException('订阅状态不允许取消');
        }
        await this.subscriptionRepository.update(subscriptionId, {
            status: subscription_entity_1.SubscriptionStatus.CANCELLED,
            autoRenew: false,
        });
        const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        return updated;
    }
    async suspendSubscription(subscriptionId) {
        const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        await this.subscriptionRepository.update(subscriptionId, {
            status: subscription_entity_1.SubscriptionStatus.SUSPENDED,
        });
        const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        return updated;
    }
    async resumeSubscription(subscriptionId) {
        const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        if (subscription.status !== subscription_entity_1.SubscriptionStatus.SUSPENDED) {
            throw new common_1.BadRequestException('只有暂停的订阅才能恢复');
        }
        await this.subscriptionRepository.update(subscriptionId, {
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
        });
        const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        return updated;
    }
    async updateUsage(subscriptionId, increment = 1) {
        const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        if (subscription.status !== subscription_entity_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.BadRequestException('订阅已过期或已取消');
        }
        const newUsed = subscription.diagnosisUsed + increment;
        if (newUsed > subscription.diagnosisLimit && subscription.diagnosisLimit !== -1) {
            throw new common_1.BadRequestException('诊断次数已用完，请升级套餐');
        }
        await this.subscriptionRepository.update(subscriptionId, {
            diagnosisUsed: newUsed,
        });
        const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        return updated;
    }
    async checkAndUpdateExpiredSubscriptions() {
        const expiredSubscriptions = await this.subscriptionRepository.find({
            where: {
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                endDate: new Date(),
            },
        });
        for (const sub of expiredSubscriptions) {
            if (sub.autoRenew) {
                await this.renewSubscription(sub.userId);
            }
            else {
                await this.subscriptionRepository.update(sub.id, {
                    status: subscription_entity_1.SubscriptionStatus.EXPIRED,
                });
            }
        }
    }
    async getSubscriptionById(id) {
        return this.subscriptionRepository.findOne({ where: { id } });
    }
    async setAutoRenew(subscriptionId, autoRenew) {
        const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        await this.subscriptionRepository.update(subscriptionId, { autoRenew });
        const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        return updated;
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        package_service_1.PackageService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map