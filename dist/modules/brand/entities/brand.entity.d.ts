import { User } from '../../user/entities/user.entity';
import { Organization } from '../../user/entities/organization.entity';
export declare enum BrandIndustry {
    TECHNOLOGY = "technology",
    ECOMMERCE = "ecommerce",
    EDUCATION = "education",
    HEALTHCARE = "healthcare",
    FINANCE = "finance",
    FOOD = "food",
    TRAVEL = "travel",
    ENTERTAINMENT = "entertainment",
    REAL_ESTATE = "real_estate",
    AUTOMOTIVE = "automotive",
    FASHION = "fashion",
    SPORTS = "sports",
    OTHER = "other"
}
export declare enum BrandStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    ARCHIVED = "archived"
}
export declare class Brand {
    id: string;
    name: string;
    domain: string;
    industry: BrandIndustry;
    description: string;
    logo: string;
    status: BrandStatus;
    seoData: {
        title?: string;
        description?: string;
        keywords?: string[];
        socialMedia?: {
            weibo?: string;
            wechat?: string;
            zhihu?: string;
            douyin?: string;
        };
    };
    contactInfo: {
        email?: string;
        phone?: string;
        address?: string;
    };
    userId: string;
    user: User;
    organizationId: string;
    organization: Organization;
    createdAt: Date;
    updatedAt: Date;
}
