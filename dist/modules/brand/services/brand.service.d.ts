import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { Organization } from '../../user/entities/organization.entity';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from '../dto/brand.dto';
export declare class BrandService {
    private brandRepository;
    private orgRepository;
    constructor(brandRepository: Repository<Brand>, orgRepository: Repository<Organization>);
    getList(query: BrandQueryDto, userId: string, organizationId: string): Promise<{
        list: Brand[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string, organizationId: string): Promise<Brand>;
    create(dto: CreateBrandDto, userId: string, organizationId: string): Promise<Brand>;
    update(id: string, dto: UpdateBrandDto, organizationId: string): Promise<Brand>;
    delete(id: string, organizationId: string): Promise<boolean>;
    hardDelete(id: string, organizationId: string): Promise<boolean>;
    getByUser(userId: string): Promise<Brand[]>;
    checkAccess(brandId: string, organizationId: string): Promise<boolean>;
    getSeoData(brandId: string, organizationId: string): Promise<Brand['seoData']>;
    updateSeoData(brandId: string, seoData: Brand['seoData'], organizationId: string): Promise<Brand>;
    getSocialMedia(brandId: string, organizationId: string): Promise<{
        weibo?: string;
        wechat?: string;
        zhihu?: string;
        douyin?: string;
    }>;
    updateSocialMedia(brandId: string, socialMedia: {
        weibo?: string;
        wechat?: string;
        zhihu?: string;
        douyin?: string;
    }, organizationId: string): Promise<Brand>;
    getStats(organizationId: string): Promise<{
        total: number;
        active: number;
        archived: number;
        byIndustry: Record<string, number>;
    }>;
}
