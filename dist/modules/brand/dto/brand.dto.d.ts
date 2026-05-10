import { BrandIndustry, BrandStatus } from '../entities/brand.entity';
export declare class CreateBrandDto {
    name: string;
    domain: string;
    industry?: BrandIndustry;
    description?: string;
    logo?: string;
    seoData?: {
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
    contactInfo?: {
        email?: string;
        phone?: string;
        address?: string;
    };
}
export declare class UpdateBrandDto {
    name?: string;
    domain?: string;
    industry?: BrandIndustry;
    description?: string;
    logo?: string;
    status?: BrandStatus;
    seoData?: {
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
    contactInfo?: {
        email?: string;
        phone?: string;
        address?: string;
    };
}
export declare class BrandQueryDto {
    keyword?: string;
    industry?: BrandIndustry;
    status?: BrandStatus;
    page?: number;
    limit?: number;
}
