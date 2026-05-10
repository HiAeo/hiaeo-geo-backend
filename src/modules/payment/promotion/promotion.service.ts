import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponType, CouponStatus } from '../../order/entities/coupon.entity';
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

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name);

  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
  ) {}

  /**
   * 促销活动规则
   */
  private readonly promotionRules: PromotionRule[] = [
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

  /**
   * 计算订单优惠
   */
  async calculateDiscount(params: {
    userId: string;
    amount: number;
    isFirstOrder?: boolean;
    membershipLevel?: string;
  }): Promise<DiscountResult> {
    const { amount, isFirstOrder, membershipLevel } = params;

    let bestDiscount = 0;
    let bestPromotion: PromotionRule | null = null;

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

  /**
   * 计算优惠金额
   */
  private calculateDiscountValue(rule: PromotionRule, amount: number): number {
    if (rule.minAmount && amount < rule.minAmount) {
      return 0;
    }

    let discount: number;

    if (rule.discountType === 'percentage') {
      discount = amount * (rule.discountValue / 100);
    } else {
      discount = rule.discountValue;
    }

    if (rule.maxDiscount && discount > rule.maxDiscount) {
      discount = rule.maxDiscount;
    }

    return Math.min(discount, amount);
  }

  /**
   * 创建优惠券
   */
  async createPromotion(data: {
    name: string;
    type: CouponType;
    discountValue: number;
    minAmount?: number;
    maxDiscount?: number;
    totalCount?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Coupon> {
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
      status: CouponStatus.ACTIVE,
    });

    return this.couponRepository.save(coupon);
  }

  /**
   * 发放优惠券给用户
   */
  async distributeCoupon(userId: string, couponId: string): Promise<boolean> {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId },
    });

    if (!coupon || coupon.status !== CouponStatus.ACTIVE) {
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

  /**
   * 使用优惠券
   */
  async useCoupon(userId: string, orderId: string, couponId?: string): Promise<boolean> {
    if (!couponId) return true;

    const userCoupon = await this.userCouponRepository.findOne({
      where: { userId, couponId },
    });

    if (!userCoupon) return false;

    userCoupon.usedAt = new Date();
    userCoupon.orderId = orderId;
    await this.userCouponRepository.save(userCoupon);

    await this.couponRepository.increment({ id: couponId }, 'usedCount', 1);
    return true;
  }

  /**
   * 退还优惠券
   */
  async returnCoupon(userId: string, orderId: string): Promise<boolean> {
    const userCoupon = await this.userCouponRepository.findOne({
      where: { userId, orderId },
    });

    if (!userCoupon || !userCoupon.usedAt) return false;

    // 删除优惠券使用记录并重新创建
    await this.userCouponRepository.delete({ id: userCoupon.id });
    
    // 重新创建未使用的优惠券记录
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

  /**
   * 获取用户优惠券列表
   */
  async getUserCoupons(userId: string): Promise<UserCoupon[]> {
    return this.userCouponRepository.find({
      where: { userId },
      relations: ['coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 生成优惠券码
   */
  private generateCouponCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'HIAEO';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
