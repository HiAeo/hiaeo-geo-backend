import { Repository } from 'typeorm';
import { Package, PackageType, PackageStatus, BillingCycle } from '../entities/package.entity';
export interface CreatePackageDto {
    name: string;
    displayName: string;
    description?: string;
    features?: string[];
    type: PackageType;
    price: number;
    originalPrice?: number;
    billingCycle: BillingCycle;
    billingCycles?: Array<{
        cycle: BillingCycle;
        price: number;
        discount?: number;
    }>;
    diagnosisLimit: number;
    reportLimit?: number;
    aiEngineLimit?: number;
    contentLimit?: number;
    brandLimit?: number;
    teamMemberLimit?: number;
    apiAccess?: boolean;
    prioritySupport?: boolean;
    customBranding?: boolean;
    isTrial?: boolean;
    trialDays?: number;
    isRecommended?: boolean;
    sortOrder?: number;
}
export interface UpdatePackageDto extends Partial<CreatePackageDto> {
    status?: PackageStatus;
}
export declare class PackageAdminService {
    private packageRepository;
    constructor(packageRepository: Repository<Package>);
    getAllPackages(includeArchived?: boolean): Promise<Package[]>;
    getPackageById(id: string): Promise<Package>;
    createPackage(dto: CreatePackageDto, userId?: string): Promise<Package>;
    updatePackage(id: string, dto: UpdatePackageDto): Promise<Package>;
    deletePackage(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    hardDeletePackage(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updatePackageStatus(id: string, status: PackageStatus): Promise<Package>;
    setRecommended(id: string, recommended: boolean): Promise<Package>;
    reorderPackages(orderedIds: string[]): Promise<Package[]>;
    duplicatePackage(id: string, newName: string): Promise<Package>;
    getPackageStats(): Promise<{
        total: number;
        active: number;
        archived: number;
        byType: Record<PackageType, number>;
        avgPrice: number;
    }>;
}
