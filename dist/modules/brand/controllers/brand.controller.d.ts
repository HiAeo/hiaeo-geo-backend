import { BrandService } from '../services/brand.service';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from '../dto/brand.dto';
import { Brand } from '../entities/brand.entity';
interface AuthenticatedRequest {
    user: {
        id: string;
        organizationId: string;
    };
}
export declare class BrandController {
    private readonly brandService;
    constructor(brandService: BrandService);
    getList(query: BrandQueryDto, req: AuthenticatedRequest): Promise<{
        list: Brand[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(req: AuthenticatedRequest): Promise<{
        total: number;
        active: number;
        archived: number;
        byIndustry: Record<string, number>;
    }>;
    getMyBrands(req: AuthenticatedRequest): Promise<Brand[]>;
    getById(id: string, req: AuthenticatedRequest): Promise<Brand>;
    getSeoData(id: string, req: AuthenticatedRequest): Promise<{
        title?: string;
        description?: string;
        keywords?: string[];
        socialMedia?: {
            weibo?: string;
            wechat?: string;
            zhihu?: string;
            douyin?: string;
        };
    }>;
    updateSeoData(id: string, seoData: Brand['seoData'], req: AuthenticatedRequest): Promise<Brand>;
    getSocialMedia(id: string, req: AuthenticatedRequest): Promise<{
        weibo?: string;
        wechat?: string;
        zhihu?: string;
        douyin?: string;
    }>;
    updateSocialMedia(id: string, body: {
        weibo?: string;
        wechat?: string;
        zhihu?: string;
        douyin?: string;
    }, req: AuthenticatedRequest): Promise<Brand>;
    create(dto: CreateBrandDto, req: AuthenticatedRequest): Promise<Brand>;
    update(id: string, dto: UpdateBrandDto, req: AuthenticatedRequest): Promise<Brand>;
    delete(id: string, req: AuthenticatedRequest): Promise<boolean>;
    hardDelete(id: string, req: AuthenticatedRequest): Promise<boolean>;
}
export {};
