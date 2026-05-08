export interface Brand {
    id: string;
    name: string;
    industry: string;
    website: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BrandService {
    private brands;
    getList(): Promise<{
        list: Brand[];
        total: number;
    }>;
    getById(id: string): Promise<Brand | null>;
    create(data: Partial<Brand>): Promise<Brand>;
    update(id: string, data: Partial<Brand>): Promise<Brand | null>;
    delete(id: string): Promise<boolean>;
}
