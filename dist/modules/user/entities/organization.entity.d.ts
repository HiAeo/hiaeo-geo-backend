export declare enum OrganizationType {
    ENTERPRISE = "enterprise",
    INDIVIDUAL = "individual",
    TRIAL = "trial"
}
export declare enum OrganizationTier {
    FREE = "free",
    BASIC = "basic",
    PROFESSIONAL = "professional",
    ENTERPRISE = "enterprise"
}
export declare class Organization {
    id: string;
    name: string;
    shortName: string;
    type: OrganizationType;
    tier: OrganizationTier;
    description: string;
    logo: string;
    website: string;
    phone: string;
    address: string;
    userCount: number;
    brandCount: number;
    maxUsers: number;
    maxBrands: number;
    settings: Record<string, any>;
    trialEndsAt: Date;
    subscriptionEndsAt: Date;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    isInTrial(): boolean;
    canAddUser(): boolean;
    canAddBrand(): boolean;
}
