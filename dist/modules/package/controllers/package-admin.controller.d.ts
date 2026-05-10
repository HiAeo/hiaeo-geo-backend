import { PackageAdminService, CreatePackageDto, UpdatePackageDto } from '../services/package-admin.service';
import { Package, PackageStatus } from '../entities/package.entity';
export declare class PackageAdminController {
    private readonly packageAdminService;
    constructor(packageAdminService: PackageAdminService);
    getAllPackages(includeArchived?: string): Promise<{
        success: boolean;
        data: Package[];
        total: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        archived: number;
        byType: Record<import("../entities/package.entity").PackageType, number>;
        avgPrice: number;
    }>;
    getPackageById(id: string): Promise<Package>;
    createPackage(dto: CreatePackageDto, req: any): Promise<{
        success: boolean;
        data: Package;
        message: string;
    }>;
    updatePackage(id: string, dto: UpdatePackageDto): Promise<{
        success: boolean;
        data: Package;
        message: string;
    }>;
    updateStatus(id: string, status: PackageStatus): Promise<{
        success: boolean;
        data: Package;
        message: string;
    }>;
    setRecommended(id: string, recommended: boolean): Promise<{
        success: boolean;
        data: Package;
        message: string;
    }>;
    reorderPackages(orderedIds: string[]): Promise<{
        success: boolean;
        data: Package[];
        message: string;
    }>;
    duplicatePackage(id: string, newName: string): Promise<{
        success: boolean;
        data: Package;
        message: string;
    }>;
    deletePackage(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    hardDeletePackage(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
