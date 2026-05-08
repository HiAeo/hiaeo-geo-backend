import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { PackageService } from '../../package/services/package.service';
import { BillingCycle } from '../../package/entities/package.entity';
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
export declare class SubscriptionService {
    private subscriptionRepository;
    private packageService;
    constructor(subscriptionRepository: Repository<Subscription>, packageService: PackageService);
    getCurrentSubscription(userId: string): Promise<Subscription | null>;
    getSubscriptionHistory(userId: string): Promise<Subscription[]>;
    createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionResult>;
    upgradeSubscription(userId: string, newPackageId: string): Promise<SubscriptionResult>;
    renewSubscription(userId: string): Promise<SubscriptionResult>;
    cancelSubscription(subscriptionId: string, reason?: string): Promise<Subscription>;
    suspendSubscription(subscriptionId: string): Promise<Subscription>;
    resumeSubscription(subscriptionId: string): Promise<Subscription>;
    updateUsage(subscriptionId: string, increment?: number): Promise<Subscription>;
    checkAndUpdateExpiredSubscriptions(): Promise<void>;
    getSubscriptionById(id: string): Promise<Subscription | null>;
    setAutoRenew(subscriptionId: string, autoRenew: boolean): Promise<Subscription>;
}
