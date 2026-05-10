import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentMethod } from '../order/entities/order.entity';
import { Payment, PaymentStatus } from '../order/entities/payment.entity';
import { OrderService } from '../order/services/order.service';
import { AlipayProvider } from './providers/alipay.provider';
import { WechatProvider } from './providers/wechat.provider';
import { PaymentSecurityService } from './security/payment-security.service';
import { PaymentConfigService } from './providers/payment-config.service';

@ApiTags('支付')
@Controller('v1/payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private orderService: OrderService,
    private alipayProvider: AlipayProvider,
    private wechatProvider: WechatProvider,
    private securityService: PaymentSecurityService,
    private configService: PaymentConfigService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  @Post('create')
  @ApiOperation({ summary: '发起支付' })
  @HttpCode(HttpStatus.OK)
  async createPayment(
    @Body() body: { orderId: string; paymentMethod: string; clientIp?: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new BadRequestException('用户未登录');
    }

    const order = await this.orderRepository.findOne({ 
      where: { id: body.orderId, userId } 
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不允许支付');
    }

    const riskResult = await this.securityService.riskCheck({
      userId,
      amount: Number(order.amount),
      ip: body.clientIp || req.ip || '127.0.0.1',
    });

    if (!riskResult.pass) {
      throw new BadRequestException(`支付被拦截: ${riskResult.reason}`);
    }

    const paymentMethod = body.paymentMethod || 'alipay';
    const payment = await this.orderService.createPayment(
      body.orderId,
      paymentMethod as PaymentMethod,
    );

    const result = await this.initiatePayment(order, payment, body.paymentMethod);

    this.securityService.logPayment('create_payment', {
      orderId: body.orderId,
      paymentMethod: body.paymentMethod,
      paymentNo: payment.paymentNo,
    }, result);

    return result;
  }

  @Post('query/:paymentNo')
  @ApiOperation({ summary: '查询支付状态' })
  @HttpCode(HttpStatus.OK)
  async queryPayment(@Param('paymentNo') paymentNo: string) {
    const payment = await this.paymentRepository.findOne({
      where: { paymentNo },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    let queryResult: any;
    if (payment.paymentMethod === PaymentMethod.ALIPAY) {
      queryResult = await this.alipayProvider.queryOrder(paymentNo);
    } else if (payment.paymentMethod === PaymentMethod.WECHAT) {
      queryResult = await this.wechatProvider.queryOrder(paymentNo);
    } else {
      return {
        success: true,
        tradeStatus: payment.status,
        paymentNo,
      };
    }

    return {
      success: queryResult.success,
      tradeStatus: payment.status,
      tradeState: queryResult.tradeStatus,
      paymentNo,
      tradeNo: queryResult.tradeNo,
    };
  }

  @Post('refund')
  @ApiOperation({ summary: '申请退款' })
  @HttpCode(HttpStatus.OK)
  async applyRefund(
    @Body() body: { orderId: string; reason?: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new BadRequestException('用户未登录');
    }

    const result = await this.orderService.refundOrder(
      body.orderId,
      userId,
      body.reason || '用户申请退款',
    );

    return result;
  }

  @Post('callback/alipay')
  @ApiOperation({ summary: '支付宝回调' })
  @HttpCode(HttpStatus.OK)
  async alipayCallback(@Body() postData: any) {
    this.logger.log(`收到支付宝回调: ${JSON.stringify(postData)}`);

    const result = await this.alipayProvider.processNotify(postData);

    if (result.success) {
      const paymentNo = postData.out_trade_no;
      await this.handlePaymentSuccess(paymentNo, {
        transactionId: postData.trade_no,
        paidAmount: parseFloat(postData.total_amount || '0'),
        paidAt: new Date(),
      });
    }

    return result.message;
  }

  @Post('callback/wechat')
  @ApiOperation({ summary: '微信支付回调' })
  @HttpCode(HttpStatus.OK)
  async wechatCallback(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log(`收到微信支付回调`);

    const result = await this.wechatProvider.processNotify({
      headers: {
        'wechatpay-signature': headers['wechatpay-signature'],
        'wechatpay-timestamp': headers['wechatpay-timestamp'],
        'wechatpay-nonce': headers['wechatpay-nonce'],
        'wechatpay-serial': headers['wechatpay-serial'],
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });

    if (result.success) {
      let transactionId = '';
      let outTradeNo = '';
      let totalAmount = 0;
      
      try {
        const data = typeof body === 'string' ? JSON.parse(body) : body;
        transactionId = data?.resource?.transaction_id || data?.transaction_id;
        outTradeNo = data?.resource?.out_trade_no || data?.out_trade_no;
        totalAmount = data?.resource?.amount?.total || 0;
      } catch {}

      if (outTradeNo) {
        await this.handlePaymentSuccess(outTradeNo, {
          transactionId,
          paidAmount: totalAmount,
          paidAt: new Date(),
        });
      }
    }

    return result.success 
      ? { code: 'SUCCESS', message: '成功' } 
      : { code: 'FAIL', message: result.message };
  }

  @Get('channels')
  @ApiOperation({ summary: '获取可用支付渠道' })
  getAvailableChannels() {
    return {
      channels: [
        { code: 'alipay', name: '支付宝', icon: 'alipay' },
        { code: 'wechat', name: '微信支付', icon: 'wechat' },
      ],
    };
  }

  @Get('status/:paymentNo')
  @ApiOperation({ summary: '获取支付状态' })
  async getPaymentStatus(@Param('paymentNo') paymentNo: string) {
    const payment = await this.paymentRepository.findOne({
      where: { paymentNo },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return {
      paymentNo: payment.paymentNo,
      status: payment.status,
      amount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      paidAt: payment.paidAt,
    };
  }

  /**
   * 发起支付
   */
  private async initiatePayment(
    order: Order,
    payment: Payment,
    paymentMethod: string,
  ): Promise<any> {
    if (paymentMethod === PaymentMethod.ALIPAY) {
      const result = await this.alipayProvider.qrCodePay({
        outTradeNo: payment.paymentNo,
        totalAmount: Number(order.amount),
        subject: order.packageName,
      });

      return {
        success: result.success,
        qrCode: result.qrCode,
        paymentNo: result.outTradeNo,
        tradeNo: result.tradeNo,
        errorMessage: result.errorMessage,
      };
    } else if (paymentMethod === PaymentMethod.WECHAT) {
      const totalAmountFen = this.securityService.yuanToFen(Number(order.amount));
      
      const result = await this.wechatProvider.unifiedOrder({
        outTradeNo: payment.paymentNo,
        totalAmount: totalAmountFen,
        subject: order.packageName,
      });

      return {
        success: result.success,
        qrCode: result.codeUrl,
        paymentNo: result.outTradeNo,
        tradeNo: result.tradeNo,
        errorMessage: result.errorMessage,
      };
    }

    return {
      success: false,
      errorMessage: '不支持的支付方式',
    };
  }

  /**
   * 处理支付成功
   */
  private async handlePaymentSuccess(
    paymentNo: string,
    data: { transactionId: string; paidAmount: number; paidAt: Date },
  ) {
    const payment = await this.paymentRepository.findOne({
      where: { paymentNo },
      relations: ['order'],
    });

    if (!payment) {
      this.logger.warn(`支付记录不存在: ${paymentNo}`);
      return;
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return;
    }

    await this.paymentRepository.update(paymentNo, {
      status: PaymentStatus.SUCCESS,
      channelTransactionId: data.transactionId,
      paidAmount: data.paidAmount,
      paidAt: data.paidAt,
    });

    await this.orderService.completeOrder(payment.orderId, {
      orderId: payment.orderId,
      paymentNo,
      status: 'success',
      transactionId: data.transactionId,
      paidAmount: data.paidAmount,
      paidAt: data.paidAt.toISOString(),
    });

    this.logger.log(`支付成功: ${paymentNo}, 交易号: ${data.transactionId}`);
  }
}
