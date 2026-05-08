import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponType, CouponStatus, UserCoupon } from '../entities/coupon.entity';

export interface ValidateCouponResult {
  valid: boolean;
  discount?: number;
  message?: string;
  coupon?: Coupon;
}

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
  ) {}

  /**
   * 验证优惠券
   */
  async validateCoupon(code: string, userId: string, orderAmount: number, packageId?: string): Promise<ValidateCouponResult> {
    // 查找优惠券
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return {
        valid: false,
        message: '优惠券不存在',
      };
    }

    // 检查状态
    if (coupon.status !== CouponStatus.ACTIVE) {
      return {
        valid: false,
        message: '优惠券已失效',
      };
    }

    // 检查时间
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return {
        valid: false,
        message: '优惠券不在使用期限内',
      };
    }

    // 检查数量
    if (coupon.totalCount > 0 && coupon.usedCount >= coupon.totalCount) {
      return {
        valid: false,
        message: '优惠券已用完',
      };
    }

    // 检查最低消费
    if (orderAmount < coupon.minAmount) {
      return {
        valid: false,
        message: `订单金额需满${coupon.minAmount}元才能使用`,
      };
    }

    // 检查适用套餐
    if (coupon.applicablePackages && coupon.applicablePackages.length > 0 && packageId) {
      if (!coupon.applicablePackages.includes(packageId)) {
        return {
          valid: false,
          message: '该优惠券不适用于所选套餐',
        };
      }
    }

    // 检查用户使用次数
    const userUsage = await this.userCouponRepository.count({
      where: { userId, couponId: coupon.id },
    });
    if (userUsage >= coupon.perUserLimit) {
      return {
        valid: false,
        message: '您已使用过该优惠券',
      };
    }

    // 检查是否首次订单优惠
    if (coupon.isFirstOrder) {
      // TODO: 检查用户是否有已完成订单
    }

    // 计算折扣
    let discount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = orderAmount * (coupon.value / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
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

  /**
   * 使用优惠券
   */
  async useCoupon(userId: string, couponCode: string, orderId: string) {
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    // 记录用户使用
    const userCoupon = this.userCouponRepository.create({
      userId,
      couponId: coupon.id,
      code: coupon.code,
      orderId,
      usedAt: new Date(),
    });
    await this.userCouponRepository.save(userCoupon);

    // 更新使用数量
    coupon.usedCount += 1;
    await this.couponRepository.save(coupon);

    return userCoupon;
  }

  /**
   * 获取用户的优惠券列表
   */
  async getUserCoupons(userId: string) {
    const now = new Date();
    
    // 获取用户使用的优惠券
    const userCoupons = await this.userCouponRepository.find({
      where: { userId },
    });

    // 获取对应的优惠券详情
    const result = [];
    for (const uc of userCoupons) {
      const coupon = await this.couponRepository.findOne({ where: { id: uc.couponId } });
      if (coupon && coupon.status === CouponStatus.ACTIVE && now <= coupon.endDate) {
        result.push({ ...uc, coupon });
      }
    }
    
    return result;
  }

  /**
   * 创建优惠券（管理员）
   */
  async createCoupon(data: Partial<Coupon>) {
    const coupon = this.couponRepository.create({
      ...data,
      code: data.code?.toUpperCase(),
    });
    return this.couponRepository.save(coupon);
  }

  /**
   * 更新优惠券（管理员）
   */
  async updateCoupon(id: string, data: Partial<Coupon>) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    Object.assign(coupon, data);
    return this.couponRepository.save(coupon);
  }

  /**
   * 失效优惠券（管理员）
   */
  async deactivateCoupon(id: string) {
    await this.couponRepository.update(id, { status: CouponStatus.INACTIVE });
    return this.couponRepository.findOne({ where: { id } });
  }

  private getDiscountMessage(coupon: Coupon, discount: number): string {
    if (coupon.type === CouponType.PERCENTAGE) {
      return `可享受${coupon.value}%折扣，立减${discount}元`;
    } else {
      return `可抵扣${discount}元`;
    }
  }
}
