import { BrandService } from '../services/brand.service';
export declare class BrandController {
    private readonly brandService;
    constructor(brandService: BrandService);
    getList(): Promise<{
        list: import("../services/brand.service").Brand[];
        total: number;
    }>;
    getById(id: string): Promise<import("../services/brand.service").Brand | null>;
    create(data: any): Promise<import("../services/brand.service").Brand>;
    update(id: string, data: any): Promise<import("../services/brand.service").Brand | null>;
    delete(id: string): Promise<boolean>;
}
