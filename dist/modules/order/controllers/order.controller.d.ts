import { OrderService } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
import { CouponService } from '../services/coupon.service';
import { PaymentMethod, OrderStatus } from '../entities/order.entity';
declare class CreateOrderDto {
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
declare class RefundOrderDto {
    reason: string;
}
declare class ValidateCouponDto {
    code: string;
    orderAmount: number;
    packageId?: string;
}
export declare class OrderController {
    private readonly orderService;
    private readonly paymentService;
    private readonly couponService;
    constructor(orderService: OrderService, paymentService: PaymentService, couponService: CouponService);
    getOrders(userId: string, status?: OrderStatus, page?: string, limit?: string): Promise<{
        orders: import("../entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getOrderStats(userId: string): Promise<{
        totalOrders: number;
        paidOrders: number;
        pendingOrders: number;
        totalSpent: number;
    }>;
    getRefunds(userId: string): Promise<import("../entities/payment.entity").Refund[]>;
    getUserCoupons(userId: string): Promise<{
        coupon: import("../entities/coupon.entity").Coupon;
        id: string;
        userId: string;
        couponId: string;
        orderId: string;
        code: string;
        usedAt: Date;
        createdAt: Date;
    }[]>;
    getOrderById(userId: string, id: string): Promise<{
        payments: import("../entities/payment.entity").Payment[];
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
    createOrder(userId: string, dto: CreateOrderDto): Promise<import("../entities/order.entity").Order>;
    cancelOrder(userId: string, id: string, reason?: string): Promise<import("../entities/order.entity").Order | null>;
    refundOrder(userId: string, id: string, dto: RefundOrderDto): Promise<{
        refundNo: string;
        refundAmount: number;
        status: string;
        message: string;
    }>;
    payOrder(userId: string, id: string, paymentMethod: PaymentMethod): Promise<{
        success: boolean;
        paymentUrl?: string;
        qrCode?: string;
        codeUrl?: string;
        tradeNo?: string;
        errorMessage?: string;
        payment: import("../entities/payment.entity").Payment;
    }>;
    validateCoupon(userId: string, dto: ValidateCouponDto): Promise<import("../services/coupon.service").ValidateCouponResult>;
    alipayCallback(params: any): Promise<{
        success: boolean;
    }>;
    wechatCallback(params: any): Promise<{
        success: boolean;
    }>;
    getPaymentInfo(paymentId: string): Promise<import("../entities/payment.entity").Payment>;
    queryPaymentStatus(id: string, paymentMethod: PaymentMethod): Promise<{
        success: boolean;
        tradeStatus: string;
    } | {
        success: boolean;
        tradeState: string;
    } | {
        success: boolean;
        errorMessage: string;
    }>;
}
export {};
