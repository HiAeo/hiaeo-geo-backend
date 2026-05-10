import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
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
export declare class PaymentTaskService implements OnModuleInit {
    private subscriptionRepository;
    private orderRepository;
    private orderService;
    private creditService;
    private configService;
    private securityService;
    private readonly logger;
    constructor(subscriptionRepository: Repository<Subscription>, orderRepository: Repository<Order>, orderService: OrderService, creditService: CreditService, configService: ConfigService, securityService: PaymentSecurityService);
    onModuleInit(): void;
    checkExpiringSubscriptions(): Promise<void>;
    processAutoRenewal(): Promise<void>;
    closeExpiredOrders(): Promise<void>;
    private processSubscriptionRenewal;
    private sendRenewalReminder;
    private sendInsufficientBalanceNotice;
}
