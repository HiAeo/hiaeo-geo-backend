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
exports.CouponService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("../entities/coupon.entity");
let CouponService = class CouponService {
    constructor(couponRepository, userCouponRepository) {
        this.couponRepository = couponRepository;
        this.userCouponRepository = userCouponRepository;
    }
    async validateCoupon(code, userId, orderAmount, packageId) {
        const coupon = await this.couponRepository.findOne({
            where: { code: code.toUpperCase() },
        });
        if (!coupon) {
            return {
                valid: false,
                message: '优惠券不存在',
            };
        }
        if (coupon.status !== coupon_entity_1.CouponStatus.ACTIVE) {
            return {
                valid: false,
                message: '优惠券已失效',
            };
        }
        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) {
            return {
                valid: false,
                message: '优惠券不在使用期限内',
            };
        }
        if (coupon.totalCount > 0 && coupon.usedCount >= coupon.totalCount) {
            return {
                valid: false,
                message: '优惠券已用完',
            };
        }
        if (orderAmount < coupon.minAmount) {
            return {
                valid: false,
                message: `订单金额需满${coupon.minAmount}元才能使用`,
            };
        }
        if (coupon.applicablePackages && coupon.applicablePackages.length > 0 && packageId) {
            if (!coupon.applicablePackages.includes(packageId)) {
                return {
                    valid: false,
                    message: '该优惠券不适用于所选套餐',
                };
            }
        }
        const userUsage = await this.userCouponRepository.count({
            where: { userId, couponId: coupon.id },
        });
        if (userUsage >= coupon.perUserLimit) {
            return {
                valid: false,
                message: '您已使用过该优惠券',
            };
        }
        if (coupon.isFirstOrder) {
        }
        let discount = 0;
        if (coupon.type === coupon_entity_1.CouponType.PERCENTAGE) {
            discount = orderAmount * (coupon.value / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        }
        else {
            discount = coupon.value;
        }
        discount = Math.min(discount, orderAmount);
        return {
            valid: true,
            discount: Math.round(discount * 100) / 100,
            message: this.getDiscountMessage(coupon, discount),
            coupon,
        };
    }
    async useCoupon(userId, couponCode, orderId) {
        const coupon = await this.couponRepository.findOne({
            where: { code: couponCode.toUpperCase() },
        });
        if (!coupon) {
            throw new common_1.NotFoundException('优惠券不存在');
        }
        const userCoupon = this.userCouponRepository.create({
            userId,
            couponId: coupon.id,
            code: coupon.code,
            orderId,
            usedAt: new Date(),
        });
        await this.userCouponRepository.save(userCoupon);
        coupon.usedCount += 1;
        await this.couponRepository.save(coupon);
        return userCoupon;
    }
    async getUserCoupons(userId) {
        const now = new Date();
        const userCoupons = await this.userCouponRepository.find({
            where: { userId },
        });
        const result = [];
        for (const uc of userCoupons) {
            const coupon = await this.couponRepository.findOne({ where: { id: uc.couponId } });
            if (coupon && coupon.status === coupon_entity_1.CouponStatus.ACTIVE && now <= coupon.endDate) {
                result.push({ ...uc, coupon });
            }
        }
        return result;
    }
    async createCoupon(data) {
        const coupon = this.couponRepository.create({
            ...data,
            code: data.code?.toUpperCase(),
        });
        return this.couponRepository.save(coupon);
    }
    async updateCoupon(id, data) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('优惠券不存在');
        }
        Object.assign(coupon, data);
        return this.couponRepository.save(coupon);
    }
    async deactivateCoupon(id) {
        await this.couponRepository.update(id, { status: coupon_entity_1.CouponStatus.INACTIVE });
        return this.couponRepository.findOne({ where: { id } });
    }
    getDiscountMessage(coupon, discount) {
        if (coupon.type === coupon_entity_1.CouponType.PERCENTAGE) {
            return `可享受${coupon.value}%折扣，立减${discount}元`;
        }
        else {
            return `可抵扣${discount}元`;
        }
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(1, (0, typeorm_1.InjectRepository)(coupon_entity_1.UserCoupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CouponService);
//# sourceMappingURL=coupon.service.js.map