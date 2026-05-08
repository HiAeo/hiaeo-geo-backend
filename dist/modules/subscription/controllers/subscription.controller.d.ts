import { SubscriptionService } from '../services/subscription.service';
import { BillingCycle } from '../../package/entities/package.entity';
declare class CreateSubscriptionDto {
    packageId: string;
    billingCycle?: BillingCycle;
}
declare class UpgradeSubscriptionDto {
    newPackageId: string;
}
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getCurrentSubscription(userId: string): Promise<import("../entities/subscription.entity").Subscription | null>;
    getSubscriptionHistory(userId: string): Promise<import("../entities/subscription.entity").Subscription[]>;
    getSubscriptionById(userId: string, id: string): Promise<import("../entities/subscription.entity").Subscription | null>;
    createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<import("../services/subscription.service").SubscriptionResult>;
    upgradeSubscription(userId: string, dto: UpgradeSubscriptionDto): Promise<import("../services/subscription.service").SubscriptionResult>;
    renewSubscription(userId: string): Promise<import("../services/subscription.service").SubscriptionResult>;
    cancelSubscription(userId: string, id: string, reason?: string): Promise<import("../entities/subscription.entity").Subscription>;
    suspendSubscription(id: string): Promise<import("../entities/subscription.entity").Subscription>;
    resumeSubscription(id: string): Promise<import("../entities/subscription.entity").Subscription>;
    setAutoRenew(id: string, autoRenew: boolean): Promise<import("../entities/subscription.entity").Subscription>;
    updateUsage(id: string, increment?: number): Promise<import("../entities/subscription.entity").Subscription>;
}
export {};
