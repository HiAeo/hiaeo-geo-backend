export declare enum PackageType {
    BASIC = "basic",
    PROFESSIONAL = "professional",
    ENTERPRISE = "enterprise"
}
export declare enum BillingCycle {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly"
}
export declare class Package {
    id: string;
    name: string;
    displayName: string;
    description: string;
    type: PackageType;
    price: number;
    originalPrice: number;
    billingCycle: BillingCycle;
    features: Record<string, any>;
    diagnosisLimit: number;
    reportLimit: number;
    aiEngineLimit: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
