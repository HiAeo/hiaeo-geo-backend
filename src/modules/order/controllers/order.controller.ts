import { Controller, Get, Post, Put, Body, Param, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
import { CouponService } from '../services/coupon.service';
import { PaymentMethod, OrderStatus } from '../entities/order.entity';

class CreateOrderDto {
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

class RefundOrderDto {
  reason: string;
}

class ValidateCouponDto {
  code: string;
  orderAmount: number;
  packageId?: string;
}

@ApiTags('订单管理')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly couponService: CouponService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: '返回订单列表' })
  async getOrders(
    @Headers('x-user-id') userId: string,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orderService.getOrders({
      userId,
      status: status as OrderStatus,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: '获取订单统计' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回订单统计' })
  async getOrderStats(@Headers('x-user-id') userId: string) {
    return this.orderService.getOrderStats(userId);
  }

  @Get('refunds')
  @ApiOperation({ summary: '获取退款记录' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回退款记录' })
  async getRefunds(@Headers('x-user-id') userId: string) {
    return this.orderService.getRefunds(userId);
  }

  @Get('coupons')
  @ApiOperation({ summary: '获取我的优惠券' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回优惠券列表' })
  async getUserCoupons(@Headers('x-user-id') userId: string) {
    return this.couponService.getUserCoupons(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回订单详情' })
  async getOrderById(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.orderService.getOrderById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  async createOrder(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    // 如果有优惠券，先验证并计算折扣
    if (dto.couponCode) {
      const couponResult = await this.couponService.validateCoupon(
        dto.couponCode,
        userId,
        dto.amount,
        dto.packageId,
      );
      if (couponResult.valid) {
        dto.discount = couponResult.discount;
      }
    }

    return this.orderService.createOrder(userId, dto);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '订单取消成功' })
  async cancelOrder(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.orderService.cancelOrder(id, userId, reason);
  }

  @Put(':id/refund')
  @ApiOperation({ summary: '申请退款' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '退款申请成功' })
  async refundOrder(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
  ) {
    return this.orderService.refundOrder(id, userId, dto.reason);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '发起支付' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回支付信息' })
  async payOrder(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: PaymentMethod,
  ) {
    // 创建支付记录
    const payment = await this.orderService.createPayment(id, paymentMethod);

    // 根据支付方式获取支付链接
    const order = await this.orderService.getOrderById(id, userId);
    const notifyUrl = `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/orders/callback/${paymentMethod.toLowerCase()}`;

    if (paymentMethod === PaymentMethod.ALIPAY) {
      const result = await this.paymentService.alipayUnifiedOrder({
        outTradeNo: payment.paymentNo,
        totalAmount: Number(order.amount),
        subject: order.packageName,
        body: `订单号: ${order.orderNo}`,
        notifyUrl,
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success?orderId=${id}`,
      });
      return { payment, ...result };
    } else if (paymentMethod === PaymentMethod.WECHAT) {
      const result = await this.paymentService.wechatUnifiedOrder({
        outTradeNo: payment.paymentNo,
        totalAmount: Number(order.amount),
        subject: order.packageName,
        body: `订单号: ${order.orderNo}`,
        notifyUrl,
      });
      return { payment, ...result };
    }

    throw new Error('不支持的支付方式');
  }

  @Post('coupon/validate')
  @ApiOperation({ summary: '验证优惠券' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回验证结果' })
  async validateCoupon(
    @Headers('x-user-id') userId: string,
    @Body() dto: ValidateCouponDto,
  ) {
    return this.couponService.validateCoupon(dto.code, userId, dto.orderAmount, dto.packageId);
  }

  @Post('callback/alipay')
  @ApiOperation({ summary: '支付宝回调' })
  @ApiResponse({ status: 200, description: '回调处理成功' })
  async alipayCallback(@Body() params: any) {
    const verified = this.paymentService.verifyAlipayNotify(params);
    if (verified) {
      await this.orderService.completeOrder(params.out_trade_no, {
        orderId: params.out_trade_no,
        paymentNo: params.trade_no,
        status: params.trade_status,
        transactionId: params.trade_no,
        paidAmount: params.total_amount,
        paidAt: params.gmt_payment,
        channelResponse: params,
      });
    }
    return { success: verified };
  }

  @Post('callback/wechat')
  @ApiOperation({ summary: '微信支付回调' })
  @ApiResponse({ status: 200, description: '回调处理成功' })
  async wechatCallback(@Body() params: any) {
    const verified = this.paymentService.verifyWechatNotify(params);
    if (verified) {
      await this.orderService.completeOrder(params.out_trade_no, {
        orderId: params.out_trade_no,
        paymentNo: params.transaction_id,
        status: params.result_code,
        transactionId: params.transaction_id,
        paidAmount: params.total_fee / 100,
        paidAt: params.time_end,
        channelResponse: params,
      });
    }
    return { success: verified };
  }

  @Get('payment/:paymentId')
  @ApiOperation({ summary: '获取支付信息' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回支付信息' })
  async getPaymentInfo(@Param('paymentId') paymentId: string) {
    return this.orderService.getPaymentInfo(paymentId);
  }

  @Post(':id/pay/query')
  @ApiOperation({ summary: '查询支付状态' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回支付状态' })
  async queryPaymentStatus(
    @Param('id') id: string,
    @Query('paymentMethod') paymentMethod: PaymentMethod,
  ) {
    const order = await this.orderService.getOrderById(id, 'system');

    if (paymentMethod === PaymentMethod.ALIPAY) {
      return this.paymentService.queryAlipayOrder(order.orderNo);
    } else if (paymentMethod === PaymentMethod.WECHAT) {
      return this.paymentService.queryWechatOrder(order.orderNo);
    }

    return { success: false, errorMessage: '不支持的支付方式' };
  }
}
