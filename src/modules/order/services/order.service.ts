import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from '../entities/order.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Refund } from '../entities/payment.entity';
import { PackageService } from '../../package/services/package.service';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import { CreditService } from '../../subscription/services/credit.service';
import { SourceType } from '../../subscription/entities/credit.entity';
import { InvitationService } from '../../invitation/services/invitation.service';

export interface CreateOrderDto {
  packageId?: string;
  packageName: string;
  amount: number;
  originalAmount?: number;
  discount?: number;
  billingCycle?: string;
  duration?: number;
  remark?: string;
  couponCode?: string;
}

export interface PaymentCallback {
  orderId: string;
  paymentNo: string;
  status: string;
  transactionId?: string;
  paidAmount?: number;
  paidAt?: string;
  channelResponse?: any;
}

export interface OrderFilter {
  userId: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    private packageService: PackageService,
    private subscriptionService: SubscriptionService,
    private creditService: CreditService,
    private invitationService: InvitationService,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建订单
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    const orderNo = this.generateOrderNo();

    // 验证套餐
    if (dto.packageId) {
      const pkg = await this.packageService.getPackageById(dto.packageId);
      if (!pkg) {
        throw new NotFoundException('套餐不存在');
      }
    }

    // 计算最终金额
    let finalAmount = dto.amount;
    let discount = dto.discount || 0;

    // 应用时长折扣
    if (dto.duration && dto.duration >= 12) {
      const yearlyDiscount = 0.2; // 年付8折
      discount += finalAmount * yearlyDiscount;
      finalAmount = finalAmount * 0.8;
    }

    const order = this.orderRepository.create({
      orderNo,
      userId,
      packageId: dto.packageId,
      packageName: dto.packageName,
      amount: finalAmount,
      originalAmount: dto.originalAmount || dto.amount,
      discount,
      status: OrderStatus.PENDING,
      remark: dto.remark,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 如果是免费订单，直接完成
    if (finalAmount === 0) {
      await this.completeOrder(savedOrder.id, {
        orderId: savedOrder.id,
        paymentNo: orderNo,
        status: 'success',
        transactionId: 'FREE' + Date.now(),
        paidAmount: 0,
        paidAt: new Date().toISOString(),
      });
    }

    return savedOrder;
  }

  /**
   * 获取订单列表
   */
  async getOrders(filter: OrderFilter) {
    const { userId, status, startDate, endDate, page = 1, limit = 10 } = filter;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();

    const orders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 获取关联的支付记录
    const payments = await this.paymentRepository.find({ where: { orderId } });

    return {
      ...order,
      payments,
    };
  }

  /**
   * 获取订单统计
   */
  async getOrderStats(userId: string) {
    const orders = await this.orderRepository.find({ where: { userId } });

    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.status === OrderStatus.PAID).length;
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const totalSpent = orders
      .filter(o => o.status === OrderStatus.PAID)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      totalSpent,
    };
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('只有待支付的订单才能取消');
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      remark: reason ? `${order.remark || ''} | 取消原因: ${reason}` : order.remark,
    });

    return this.orderRepository.findOne({ where: { id: orderId } });
  }

  /**
   * 创建支付记录
   */
  async createPayment(orderId: string, paymentMethod: PaymentMethod) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.amount === 0) {
      throw new BadRequestException('免费订单无需支付');
    }

    const paymentNo = this.generatePaymentNo();

    const payment = this.paymentRepository.create({
      orderId,
      paymentNo,
      status: PaymentStatus.PENDING,
      totalAmount: order.amount,
      paidAmount: 0,
      paymentMethod,
      expireAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
    });

    return this.paymentRepository.save(payment);
  }

  /**
   * 获取支付信息
   */
  async getPaymentInfo(paymentId: string) {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }
    return payment;
  }

  /**
   * 通过支付号获取支付记录
   */
  async getPaymentByPaymentNo(paymentNo: string) {
    return this.paymentRepository.findOne({ where: { paymentNo } });
  }

  /**
   * 完成订单支付（回调）
   */
  async completeOrder(orderId: string, callback: PaymentCallback) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId } });
      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (order.status === OrderStatus.PAID) {
        throw new BadRequestException('订单已支付');
      }

      // 更新订单状态
      await queryRunner.manager.update(Order, orderId, {
        status: OrderStatus.PAID,
        paymentTime: callback.paidAt ? new Date(callback.paidAt) : new Date(),
        transactionId: callback.transactionId,
      });

      // 更新支付记录
      if (callback.paymentNo) {
        await queryRunner.manager.update(Payment, { paymentNo: callback.paymentNo }, {
          status: PaymentStatus.SUCCESS,
          paidAmount: callback.paidAmount || order.amount,
          paidAt: callback.paidAt ? new Date(callback.paidAt) : new Date(),
          channelTransactionId: callback.transactionId,
          channelResponse: callback.channelResponse,
        });
      }

      // 创建订阅
      if (order.packageId) {
        try {
          await this.subscriptionService.createSubscription({
            userId: order.userId,
            packageId: order.packageId,
          });

          // 赠送积分（每10元送1积分）
          const credits = Math.floor(order.amount / 10);
          if (credits > 0) {
            await this.creditService.earnCredits({
              userId: order.userId,
              amount: credits,
              sourceType: SourceType.SUBSCRIPTION,
              description: `订阅${order.packageName}赠送积分`,
              relatedOrderId: order.id,
            });
          }
        } catch (error) {
          console.error('创建订阅失败:', error);
        }
      }

      // 完成邀请（如果有）
      try {
        await this.invitationService.completeInvitation(orderId, order.userId);
      } catch (error) {
        console.error('完成邀请奖励失败:', error);
      }

      await queryRunner.commitTransaction();

      return {
        orderId,
        status: 'success',
        message: '支付成功',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 申请退款
   */
  async refundOrder(orderId: string, userId: string, reason: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId, userId } });
      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (order.status !== OrderStatus.PAID) {
        throw new BadRequestException('只有已支付的订单才能退款');
      }

      // 检查退款期限（7天内）
      const paidTime = new Date(order.paymentTime);
      const now = new Date();
      const daysDiff = (now.getTime() - paidTime.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7) {
        throw new BadRequestException('已超过7天退款期限');
      }

      // 创建退款记录
      const refundNo = this.generateRefundNo();
      const refund = queryRunner.manager.create(Refund, {
        orderId,
        paymentId: '', // 需要根据实际情况填写
        refundNo,
        refundAmount: order.amount,
        reason,
        status: 'pending',
      });
      await queryRunner.manager.save(refund);

      // 更新订单状态
      await queryRunner.manager.update(Order, orderId, {
        status: OrderStatus.REFUNDED,
      });

      // 扣除积分（按比例）
      const credits = Math.floor(Number(order.amount) / 10);
      if (credits > 0) {
        try {
          await this.creditService.refundCredits(
            order.userId,
            credits,
            `退款-${order.packageName}`,
            orderId,
          );
        } catch (error) {
          console.error('积分退还失败:', error);
        }
      }

      await queryRunner.commitTransaction();

      return {
        refundNo,
        refundAmount: order.amount,
        status: 'pending',
        message: '退款申请已提交，将在1-3个工作日内处理',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取退款记录
   */
  async getRefunds(userId: string) {
    const orders = await this.orderRepository.find({ where: { userId, status: OrderStatus.REFUNDED } });
    const orderIds = orders.map(o => o.id);

    return this.refundRepository.find({
      where: orderIds.map(id => ({ orderId: id })) as any,
      order: { createdAt: 'DESC' },
    });
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `HIAEO${timestamp}${random}`;
  }

  private generatePaymentNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY${timestamp}${random}`;
  }

  private generateRefundNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF${timestamp}${random}`;
  }
}
