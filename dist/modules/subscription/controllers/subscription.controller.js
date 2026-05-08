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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscription_service_1 = require("../services/subscription.service");
class CreateSubscriptionDto {
}
class UpgradeSubscriptionDto {
}
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getCurrentSubscription(userId) {
        return this.subscriptionService.getCurrentSubscription(userId);
    }
    async getSubscriptionHistory(userId) {
        return this.subscriptionService.getSubscriptionHistory(userId);
    }
    async getSubscriptionById(userId, id) {
        return this.subscriptionService.getSubscriptionById(id);
    }
    async createSubscription(userId, dto) {
        return this.subscriptionService.createSubscription({
            userId,
            packageId: dto.packageId,
            billingCycle: dto.billingCycle,
        });
    }
    async upgradeSubscription(userId, dto) {
        return this.subscriptionService.upgradeSubscription(userId, dto.newPackageId);
    }
    async renewSubscription(userId) {
        return this.subscriptionService.renewSubscription(userId);
    }
    async cancelSubscription(userId, id, reason) {
        return this.subscriptionService.cancelSubscription(id, reason);
    }
    async suspendSubscription(id) {
        return this.subscriptionService.suspendSubscription(id);
    }
    async resumeSubscription(id) {
        return this.subscriptionService.resumeSubscription(id);
    }
    async setAutoRenew(id, autoRenew) {
        return this.subscriptionService.setAutoRenew(id, autoRenew);
    }
    async updateUsage(id, increment) {
        return this.subscriptionService.updateUsage(id, increment || 1);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前订阅' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回当前订阅信息' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getCurrentSubscription", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: '获取订阅历史' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回订阅历史' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取订阅详情' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回订阅详情' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建订阅' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '订阅创建成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Put)('upgrade'),
    (0, swagger_1.ApiOperation)({ summary: '升级订阅' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅升级成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpgradeSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "upgradeSubscription", null);
__decorate([
    (0, common_1.Put)('renew'),
    (0, swagger_1.ApiOperation)({ summary: '续费订阅' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅续费成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "renewSubscription", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消订阅' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅取消成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Put)(':id/suspend'),
    (0, swagger_1.ApiOperation)({ summary: '暂停订阅' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅暂停成功' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "suspendSubscription", null);
__decorate([
    (0, common_1.Put)(':id/resume'),
    (0, swagger_1.ApiOperation)({ summary: '恢复订阅' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅恢复成功' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "resumeSubscription", null);
__decorate([
    (0, common_1.Put)(':id/auto-renew'),
    (0, swagger_1.ApiOperation)({ summary: '设置自动续费' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '设置成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('autoRenew')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "setAutoRenew", null);
__decorate([
    (0, common_1.Put)(':id/usage'),
    (0, swagger_1.ApiOperation)({ summary: '更新使用量' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('increment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updateUsage", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, swagger_1.ApiTags)('订阅管理'),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map