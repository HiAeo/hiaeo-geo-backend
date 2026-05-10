import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../subscription/entities/subscription.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderService } from '../../order/services/order.service';
import { CreditService } from '../../subscription/services/credit.service';
import { ConfigService } from '../../../config/config.service';
import { PaymentSecurityService } from '../security/payment-security.service';

export interface RenewalResult {
  subscriptionId: string;
  userId: string;
  success: boolean;
  message?: string;
}

@Injectable()
export class PaymentTaskService implements OnModuleInit {
  private readonly logger = new Logger(PaymentTaskService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderService: OrderService,
    private creditService: CreditService,
    private configService: ConfigService,
    private securityService: PaymentSecurityService,
  ) {}

  onModuleInit() {
    this.logger.log('支付定时任务服务已启动');
  }

  /**
   * 每天凌晨2点检查即将到期的订阅
   */
  @Cron('0 2 * * *', { name: 'checkExpiringSubscriptions' })
  async checkExpiringSubscriptions() {
    if (this.configService.isProduction() && this.configService.get('ENABLE_RENEWAL_TASK', 'true') !== 'true') {
      return;
    }

    this.logger.log('开始检查即将到期的订阅...');

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: Between(now, sevenDaysLater),
      },
    });

    this.logger.log(`发现 ${expiringSubscriptions.length} 个即将到期的订阅`);

    for (const subscription of expiringSubscriptions) {
      try {
        await this.sendRenewalReminder(subscription);
      } catch (error) {
        this.logger.error(`发送续费提醒失败: ${error.message}`);
      }
    }
  }

  /**
   * 每天凌晨3点执行自动续费
   */
  @Cron('0 3 * * *', { name: 'processAutoRenewal' })
  async processAutoRenewal() {
    if (this.configService.get('ENABLE_AUTO_RENEWAL', 'false') !== 'true') {
      return;
    }

    this.logger.log('开始处理自动续费...');

    const now = new Date();

    const expiringSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(now),
        autoRenew: true,
      },
    });

    this.logger.log(`发现 ${expiringSubscriptions.length} 个需要自动续费的订阅`);

    const results: RenewalResult[] = [];

    for (const subscription of expiringSubscriptions) {
      try {
        const result = await this.processSubscriptionRenewal(subscription);
        results.push(result);
      } catch (error) {
        this.logger.error(`自动续费失败: ${error.message}`);
        results.push({
          subscriptionId: subscription.id,
          userId: subscription.userId,
          success: false,
          message: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    this.logger.log(`自动续费完成: 成功 ${successCount}/${results.length}`);
  }

  /**
   * 每小时检查超时未支付的订单
   */
  @Cron('0 * * * *', { name: 'closeExpiredOrders' })
  async closeExpiredOrders() {
    if (this.configService.get('ENABLE_ORDER_CLEANUP', 'true') !== 'true') {
      return;
    }

    this.logger.log('开始检查超时订单...');

    const now = new Date();
    const expireTime = new Date(now.getTime() - 30 * 60 * 1000);

    const expiredOrders = await this.orderRepository.find({
      where: {
        status: 'pending',
      },
    });

    const filteredOrders = expiredOrders.filter(order => {
      const createdAt = new Date(order.createdAt);
      return createdAt < expireTime;
    });

    this.logger.log(`发现 ${filteredOrders.length} 个超时订单`);

    for (const order of filteredOrders) {
      try {
        await this.orderService.cancelOrder(order.id, order.userId, '支付超时自动取消');
        this.logger.log(`已关闭超时订单: ${order.id}`);
      } catch (error) {
        this.logger.error(`关闭超时订单失败: ${error.message}`);
      }
    }
  }

  /**
   * 处理单个订阅续费
   */
  private async processSubscriptionRenewal(subscription: Subscription): Promise<RenewalResult> {
    const userId = subscription.userId;

    const balance = await this.creditService.getBalance(userId);
    const requiredCredits = 100; // 简化，实际应从套餐获取

    if (balance < requiredCredits) {
      await this.sendInsufficientBalanceNotice(subscription);
      return {
        subscriptionId: subscription.id,
        userId,
        success: false,
        message: '余额不足，自动续费失败',
      };
    }

    // 更新订阅到期日期
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    await this.subscriptionRepository.update(subscription.id, {
      endDate: newEndDate,
    });

    this.logger.log(`订阅 ${subscription.id} 自动续费成功`);

    return {
      subscriptionId: subscription.id,
      userId,
      success: true,
    };
  }

  /**
   * 发送续费提醒
   */
  private async sendRenewalReminder(subscription: Subscription) {
    const daysUntilExpiry = Math.ceil(
      (new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    this.logger.log(`发送续费提醒: 用户 ${subscription.userId}, ${daysUntilExpiry} 天后到期`);
  }

  /**
   * 发送余额不足提醒
   */
  private async sendInsufficientBalanceNotice(subscription: Subscription) {
    this.logger.log(`发送余额不足提醒: 用户 ${subscription.userId}`);
  }
}
