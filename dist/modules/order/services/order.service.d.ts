import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from '../entities/order.entity';
import { Payment } from '../entities/payment.entity';
import { Refund } from '../entities/payment.entity';
import { PackageService } from '../../package/services/package.service';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import { CreditService } from '../../subscription/services/credit.service';
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
export declare class OrderService {
    private orderRepository;
    private paymentRepository;
    private refundRepository;
    private packageService;
    private subscriptionService;
    private creditService;
    private dataSource;
    constructor(orderRepository: Repository<Order>, paymentRepository: Repository<Payment>, refundRepository: Repository<Refund>, packageService: PackageService, subscriptionService: SubscriptionService, creditService: CreditService, dataSource: DataSource);
    createOrder(userId: string, dto: CreateOrderDto): Promise<Order>;
    getOrders(filter: OrderFilter): Promise<{
        orders: Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getOrderById(orderId: string, userId: string): Promise<{
        payments: Payment[];
        id: string;
        orderNo: string;
        userId: string;
        packageId: string;
        packageName: string;
        amount: number;
        originalAmount: number;
        discount: number;
        status: OrderStatus;
        paymentMethod: PaymentMethod;
        paymentTime: Date;
        transactionId: string;
        remark: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getOrderStats(userId: string): Promise<{
        totalOrders: number;
        paidOrders: number;
        pendingOrders: number;
        totalSpent: number;
    }>;
    cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order | null>;
    createPayment(orderId: string, paymentMethod: PaymentMethod): Promise<Payment>;
    getPaymentInfo(paymentId: string): Promise<Payment>;
    completeOrder(orderId: string, callback: PaymentCallback): Promise<{
        orderId: string;
        status: string;
        message: string;
    }>;
    refundOrder(orderId: string, userId: string, reason: string): Promise<{
        refundNo: string;
        refundAmount: number;
        status: string;
        message: string;
    }>;
    getRefunds(userId: string): Promise<Refund[]>;
    private generateOrderNo;
    private generatePaymentNo;
    private generateRefundNo;
}
