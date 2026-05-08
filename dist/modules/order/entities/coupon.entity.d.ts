export declare enum CouponType {
    PERCENTAGE = "percentage",
    FIXED = "fixed"
}
export declare enum CouponStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired"
}
export declare class Coupon {
    id: string;
    code: string;
    name: string;
    description: string;
    type: CouponType;
    value: number;
    minAmount: number;
    maxDiscount: number;
    totalCount: number;
    usedCount: number;
    perUserLimit: number;
    startDate: Date;
    endDate: Date;
    applicablePackages: string[];
    isFirstOrder: boolean;
    status: CouponStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserCoupon {
    id: string;
    userId: string;
    couponId: string;
    orderId: string;
    code: string;
    usedAt: Date;
    createdAt: Date;
}
