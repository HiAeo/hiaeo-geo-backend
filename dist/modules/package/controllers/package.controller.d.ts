import { PackageService } from '../services/package.service';
export declare class PackageController {
    private readonly packageService;
    constructor(packageService: PackageService);
    getPackages(type?: string): Promise<import("../entities/package.entity").Package[]>;
    getPackageById(id: string): Promise<import("../entities/package.entity").Package | null>;
}
