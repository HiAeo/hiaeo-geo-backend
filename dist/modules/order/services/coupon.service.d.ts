import { Repository } from 'typeorm';
import { Coupon, UserCoupon } from '../entities/coupon.entity';
export interface ValidateCouponResult {
    valid: boolean;
    discount?: number;
    message?: string;
    coupon?: Coupon;
}
export declare class CouponService {
    private couponRepository;
    private userCouponRepository;
    constructor(couponRepository: Repository<Coupon>, userCouponRepository: Repository<UserCoupon>);
    validateCoupon(code: string, userId: string, orderAmount: number, packageId?: string): Promise<ValidateCouponResult>;
    useCoupon(userId: string, couponCode: string, orderId: string): Promise<UserCoupon>;
    getUserCoupons(userId: string): Promise<{
        coupon: Coupon;
        id: string;
        userId: string;
        couponId: string;
        orderId: string;
        code: string;
        usedAt: Date;
        createdAt: Date;
    }[]>;
    createCoupon(data: Partial<Coupon>): Promise<Coupon>;
    updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon>;
    deactivateCoupon(id: string): Promise<Coupon | null>;
    private getDiscountMessage;
}
