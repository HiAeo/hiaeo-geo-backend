import { Repository } from 'typeorm';
import { Package } from '../entities/package.entity';
export declare class PackageService {
    private packageRepository;
    constructor(packageRepository: Repository<Package>);
    getPackages(type?: string): Promise<Package[]>;
    getPackageById(id: string): Promise<Package | null>;
    createPackage(data: Partial<Package>): Promise<Package>;
}
