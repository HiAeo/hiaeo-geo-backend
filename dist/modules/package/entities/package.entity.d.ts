export declare enum PackageType {
    BASIC = "basic",
    PROFESSIONAL = "professional",
    ENTERPRISE = "enterprise",
    TRIAL = "trial"
}
export declare enum BillingCycle {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly"
}
export declare enum PackageStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare class Package {
    id: string;
    name: string;
    displayName: string;
    description: string;
    features: string;
    type: PackageType;
    price: number;
    originalPrice: number;
    billingCycle: BillingCycle;
    billingCycles: Array<{
        cycle: BillingCycle;
        price: number;
        discount?: number;
    }>;
    diagnosisLimit: number;
    reportLimit: number;
    aiEngineLimit: number;
    contentLimit: number;
    brandLimit: number;
    teamMemberLimit: number;
    apiAccess: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    status: PackageStatus;
    isTrial: boolean;
    trialDays: number;
    isRecommended: boolean;
    sortOrder: number;
    effectiveDate: Date;
    expiryDate: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    getFeaturesList(): string[];
    getPriceForCycle(cycle: BillingCycle): number;
}
