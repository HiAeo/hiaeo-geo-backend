import { Repository } from 'typeorm';
import { Coupon, CouponType } from '../../order/entities/coupon.entity';
import { UserCoupon } from '../../order/entities/coupon.entity';
export interface PromotionRule {
    type: 'first_order' | 'seasonal' | 'festival' | 'membership' | 'referral';
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minAmount?: number;
    maxDiscount?: number;
}
export interface DiscountResult {
    success: boolean;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    couponId?: string;
    promotionName?: string;
}
export declare class PromotionService {
    private couponRepository;
    private userCouponRepository;
    private readonly logger;
    constructor(couponRepository: Repository<Coupon>, userCouponRepository: Repository<UserCoupon>);
    private readonly promotionRules;
    calculateDiscount(params: {
        userId: string;
        amount: number;
        isFirstOrder?: boolean;
        membershipLevel?: string;
    }): Promise<DiscountResult>;
    private calculateDiscountValue;
    createPromotion(data: {
        name: string;
        type: CouponType;
        discountValue: number;
        minAmount?: number;
        maxDiscount?: number;
        totalCount?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Coupon>;
    distributeCoupon(userId: string, couponId: string): Promise<boolean>;
    useCoupon(userId: string, orderId: string, couponId?: string): Promise<boolean>;
    returnCoupon(userId: string, orderId: string): Promise<boolean>;
    getUserCoupons(userId: string): Promise<UserCoupon[]>;
    private generateCouponCode;
}
