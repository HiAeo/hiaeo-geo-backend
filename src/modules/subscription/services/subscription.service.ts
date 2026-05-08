import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { PackageService } from '../../package/services/package.service';
import { Package, BillingCycle } from '../../package/entities/package.entity';

export interface CreateSubscriptionDto {
  userId: string;
  packageId: string;
  billingCycle?: BillingCycle;
}

export interface SubscriptionResult {
  subscription: Subscription;
  creditsEarned: number;
  message: string;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private packageService: PackageService,
  ) {}

  /**
   * 获取用户当前活跃订阅
   */
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { endDate: 'DESC' },
    });
  }

  /**
   * 获取订阅历史
   */
  async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 创建新订阅
   */
  async createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionResult> {
    const pkg = await this.packageService.getPackageById(dto.packageId);
    if (!pkg) {
      throw new NotFoundException('套餐不存在');
    }

    // 检查是否已有活跃订阅
    const existing = await this.getCurrentSubscription(dto.userId);
    if (existing) {
      throw new BadRequestException('用户已有活跃订阅，请先取消当前订阅');
    }

    const now = new Date();
    let endDate: Date;

    switch (pkg.billingCycle) {
      case BillingCycle.MONTHLY:
        endDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case BillingCycle.QUARTERLY:
        endDate = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case BillingCycle.YEARLY:
        endDate = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      default:
        endDate = new Date(now.setMonth(now.getMonth() + 1));
    }

    const subscription = this.subscriptionRepository.create({
      userId: dto.userId,
      packageId: pkg.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate,
      diagnosisUsed: 0,
      diagnosisLimit: pkg.diagnosisLimit,
      autoRenew: true,
    });

    const saved = await this.subscriptionRepository.save(subscription);

    // 计算赠送积分（每消费10元送1积分）
    const creditsEarned = Math.floor(pkg.price / 10);

    return {
      subscription: saved,
      creditsEarned,
      message: `订阅成功！您的${pkg.displayName}订阅已生效，到期时间为${endDate.toLocaleDateString('zh-CN')}`,
    };
  }

  /**
   * 升级订阅
   */
  async upgradeSubscription(userId: string, newPackageId: string): Promise<SubscriptionResult> {
    const currentSub = await this.getCurrentSubscription(userId);
    if (!currentSub) {
      throw new BadRequestException('用户暂无订阅');
    }

    const currentPkg = await this.packageService.getPackageById(currentSub.packageId);
    const newPkg = await this.packageService.getPackageById(newPackageId);

    if (!newPkg) {
      throw new NotFoundException('目标套餐不存在');
    }

    // 计算剩余天数比例
    const totalDays = Math.ceil((currentSub.endDate.getTime() - currentSub.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const usedDays = Math.ceil((new Date().getTime() - currentSub.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingRatio = Math.max(0, (totalDays - usedDays) / totalDays);

    // 按比例退还当前订阅剩余价值
    const refundValue = currentPkg ? currentPkg.price * remainingRatio : 0;
    const finalPrice = Math.max(0, newPkg.price - refundValue);

    // 取消当前订阅
    await this.cancelSubscription(currentSub.id, 'upgrade');

    // 创建新订阅
    const result = await this.createSubscription({ userId, packageId: newPackageId });

    return {
      ...result,
      message: `升级成功！从${currentPkg?.name || '免费版'}升级到${newPkg.name}，已抵扣${Math.round(refundValue)}元`,
    };
  }

  /**
   * 续费订阅
   */
  async renewSubscription(userId: string): Promise<SubscriptionResult> {
    const currentSub = await this.getCurrentSubscription(userId);
    if (!currentSub) {
      throw new BadRequestException('用户暂无订阅');
    }

    const pkg = await this.packageService.getPackageById(currentSub.packageId);
    if (!pkg) {
      throw new NotFoundException('订阅套餐不存在');
    }

    // 延长结束日期
    let newEndDate = new Date(currentSub.endDate);
    switch (pkg.billingCycle) {
      case BillingCycle.MONTHLY:
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        newEndDate.setMonth(newEndDate.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        break;
    }

    await this.subscriptionRepository.update(currentSub.id, {
      endDate: newEndDate,
      diagnosisUsed: 0, // 重置使用量
    });

    const updated = await this.subscriptionRepository.findOne({ where: { id: currentSub.id } });
    const creditsEarned = Math.floor(pkg.price / 10);

    return {
      subscription: updated!,
      creditsEarned,
      message: `续费成功！您的订阅已延长至${newEndDate.toLocaleDateString('zh-CN')}`,
    };
  }

  /**
   * 取消订阅
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('订阅状态不允许取消');
    }

    await this.subscriptionRepository.update(subscriptionId, {
      status: SubscriptionStatus.CANCELLED,
      autoRenew: false,
    });

    const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    return updated!;
  }

  /**
   * 暂停订阅
   */
  async suspendSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    await this.subscriptionRepository.update(subscriptionId, {
      status: SubscriptionStatus.SUSPENDED,
    });

    const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    return updated!;
  }

  /**
   * 恢复订阅
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    if (subscription.status !== SubscriptionStatus.SUSPENDED) {
      throw new BadRequestException('只有暂停的订阅才能恢复');
    }

    await this.subscriptionRepository.update(subscriptionId, {
      status: SubscriptionStatus.ACTIVE,
    });

    const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    return updated!;
  }

  /**
   * 更新订阅使用量
   */
  async updateUsage(subscriptionId: string, increment: number = 1): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('订阅已过期或已取消');
    }

    const newUsed = subscription.diagnosisUsed + increment;
    if (newUsed > subscription.diagnosisLimit && subscription.diagnosisLimit !== -1) {
      throw new BadRequestException('诊断次数已用完，请升级套餐');
    }

    await this.subscriptionRepository.update(subscriptionId, {
      diagnosisUsed: newUsed,
    });

    const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    return updated!;
  }

  /**
   * 检查订阅状态并更新过期订阅
   */
  async checkAndUpdateExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: new Date(),
      },
    });

    for (const sub of expiredSubscriptions) {
      // 处理自动续费
      if (sub.autoRenew) {
        // 尝试自动续费逻辑
        await this.renewSubscription(sub.userId);
      } else {
        // 标记为过期
        await this.subscriptionRepository.update(sub.id, {
          status: SubscriptionStatus.EXPIRED,
        });
      }
    }
  }

  /**
   * 获取订阅详情
   */
  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({ where: { id } });
  }

  /**
   * 设置自动续费
   */
  async setAutoRenew(subscriptionId: string, autoRenew: boolean): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    await this.subscriptionRepository.update(subscriptionId, { autoRenew });

    const updated = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    return updated!;
  }
}
