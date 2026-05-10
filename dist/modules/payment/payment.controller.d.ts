import { Request } from 'express';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Payment, PaymentStatus } from '../order/entities/payment.entity';
import { OrderService } from '../order/services/order.service';
import { AlipayProvider } from './providers/alipay.provider';
import { WechatProvider } from './providers/wechat.provider';
import { PaymentSecurityService } from './security/payment-security.service';
import { PaymentConfigService } from './providers/payment-config.service';
export declare class PaymentController {
    private orderService;
    private alipayProvider;
    private wechatProvider;
    private securityService;
    private configService;
    private orderRepository;
    private paymentRepository;
    private readonly logger;
    constructor(orderService: OrderService, alipayProvider: AlipayProvider, wechatProvider: WechatProvider, securityService: PaymentSecurityService, configService: PaymentConfigService, orderRepository: Repository<Order>, paymentRepository: Repository<Payment>);
    createPayment(body: {
        orderId: string;
        paymentMethod: string;
        clientIp?: string;
    }, req: Request): Promise<any>;
    queryPayment(paymentNo: string): Promise<{
        success: boolean;
        tradeStatus: PaymentStatus;
        paymentNo: string;
        tradeState?: undefined;
        tradeNo?: undefined;
    } | {
        success: any;
        tradeStatus: PaymentStatus;
        tradeState: any;
        paymentNo: string;
        tradeNo: any;
    }>;
    applyRefund(body: {
        orderId: string;
        reason?: string;
    }, req: Request): Promise<{
        refundNo: string;
        refundAmount: number;
        status: string;
        message: string;
    }>;
    alipayCallback(postData: any): Promise<string>;
    wechatCallback(body: any, headers: Record<string, string>): Promise<{
        code: string;
        message: string;
    }>;
    getAvailableChannels(): {
        channels: {
            code: string;
            name: string;
            icon: string;
        }[];
    };
    getPaymentStatus(paymentNo: string): Promise<{
        paymentNo: string;
        status: PaymentStatus;
        amount: number;
        paidAmount: number;
        paidAt: Date;
    }>;
    private initiatePayment;
    private handlePaymentSuccess;
}
