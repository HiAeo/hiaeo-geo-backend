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
var PromotionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("../../order/entities/coupon.entity");
const coupon_entity_2 = require("../../order/entities/coupon.entity");
let PromotionService = PromotionService_1 = class PromotionService {
    constructor(couponRepository, userCouponRepository) {
        this.couponRepository = couponRepository;
        this.userCouponRepository = userCouponRepository;
        this.logger = new common_1.Logger(PromotionService_1.name);
        this.promotionRules = [
            {
                type: 'first_order',
                name: '首单立减',
                discountType: 'fixed',
                discountValue: 10,
                minAmount: 100,
                maxDiscount: 50,
            },
            {
                type: 'membership',
                name: '会员专享',
                discountType: 'percentage',
                discountValue: 10,
                minAmount: 0,
                maxDiscount: 100,
            },
        ];
    }
    async calculateDiscount(params) {
        const { amount, isFirstOrder, membershipLevel } = params;
        let bestDiscount = 0;
        let bestPromotion = null;
        if (isFirstOrder) {
            const firstOrderPromotion = this.promotionRules.find(r => r.type === 'first_order');
            if (firstOrderPromotion) {
                bestDiscount = this.calculateDiscountValue(firstOrderPromotion, amount);
                bestPromotion = firstOrderPromotion;
            }
        }
        if (membershipLevel && membershipLevel !== 'free') {
            const memberPromotion = this.promotionRules.find(r => r.type === 'membership');
            if (memberPromotion) {
                const memberDiscount = this.calculateDiscountValue(memberPromotion, amount);
                if (memberDiscount > bestDiscount) {
                    bestDiscount = memberDiscount;
                    bestPromotion = memberPromotion;
                }
            }
        }
        return {
            success: true,
            originalAmount: amount,
            discountAmount: bestDiscount,
            finalAmount: Math.max(0, amount - bestDiscount),
            promotionName: bestPromotion?.name,
        };
    }
    calculateDiscountValue(rule, amount) {
        if (rule.minAmount && amount < rule.minAmount) {
            return 0;
        }
        let discount;
        if (rule.discountType === 'percentage') {
            discount = amount * (rule.discountValue / 100);
        }
        else {
            discount = rule.discountValue;
        }
        if (rule.maxDiscount && discount > rule.maxDiscount) {
            discount = rule.maxDiscount;
        }
        return Math.min(discount, amount);
    }
    async createPromotion(data) {
        const coupon = this.couponRepository.create({
            code: this.generateCouponCode(),
            name: data.name,
            type: data.type,
            value: data.discountValue,
            minAmount: data.minAmount || 0,
            maxDiscount: data.maxDiscount,
            totalCount: data.totalCount || 1000,
            usedCount: 0,
            startDate: data.startDate || new Date(),
            endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: coupon_entity_1.CouponStatus.ACTIVE,
        });
        return this.couponRepository.save(coupon);
    }
    async distributeCoupon(userId, couponId) {
        const coupon = await this.couponRepository.findOne({
            where: { id: couponId },
        });
        if (!coupon || coupon.status !== coupon_entity_1.CouponStatus.ACTIVE) {
            return false;
        }
        if (coupon.totalCount && coupon.usedCount >= coupon.totalCount) {
            return false;
        }
        const existing = await this.userCouponRepository.findOne({
            where: { userId, couponId },
        });
        if (existing) {
            return false;
        }
        const userCoupon = this.userCouponRepository.create({
            userId,
            couponId,
            code: coupon.code,
        });
        await this.userCouponRepository.save(userCoupon);
        return true;
    }
    async useCoupon(userId, orderId, couponId) {
        if (!couponId)
            return true;
        const userCoupon = await this.userCouponRepository.findOne({
            where: { userId, couponId },
        });
        if (!userCoupon)
            return false;
        userCoupon.usedAt = new Date();
        userCoupon.orderId = orderId;
        await this.userCouponRepository.save(userCoupon);
        await this.couponRepository.increment({ id: couponId }, 'usedCount', 1);
        return true;
    }
    async returnCoupon(userId, orderId) {
        const userCoupon = await this.userCouponRepository.findOne({
            where: { userId, orderId },
        });
        if (!userCoupon || !userCoupon.usedAt)
            return false;
        await this.userCouponRepository.delete({ id: userCoupon.id });
        const coupon = await this.couponRepository.findOne({ where: { id: userCoupon.couponId } });
        if (coupon) {
            const newUserCoupon = this.userCouponRepository.create({
                userId,
                couponId: userCoupon.couponId,
                code: coupon.code,
            });
            await this.userCouponRepository.save(newUserCoupon);
        }
        await this.couponRepository.decrement({ id: userCoupon.couponId }, 'usedCount', 1);
        return true;
    }
    async getUserCoupons(userId) {
        return this.userCouponRepository.find({
            where: { userId },
            relations: ['coupon'],
            order: { createdAt: 'DESC' },
        });
    }
    generateCouponCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'HIAEO';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
};
exports.PromotionService = PromotionService;
exports.PromotionService = PromotionService = PromotionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(1, (0, typeorm_1.InjectRepository)(coupon_entity_2.UserCoupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PromotionService);
//# sourceMappingURL=promotion.service.js.map