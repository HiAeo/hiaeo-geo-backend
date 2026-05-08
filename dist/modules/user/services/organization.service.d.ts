import { Repository } from 'typeorm';
import { Organization, OrganizationTier } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto';
export declare class OrganizationService {
    private organizationRepository;
    private userRepository;
    constructor(organizationRepository: Repository<Organization>, userRepository: Repository<User>);
    create(dto: CreateOrganizationDto): Promise<Organization>;
    update(organizationId: string, dto: UpdateOrganizationDto): Promise<Organization>;
    findOne(organizationId: string): Promise<Organization>;
    findAll(): Promise<Organization[]>;
    remove(organizationId: string): Promise<void>;
    updateUserCount(organizationId: string, delta: number): Promise<void>;
    updateBrandCount(organizationId: string, delta: number): Promise<void>;
    getTierLimits(tier: OrganizationTier): {
        maxUsers: number;
        maxBrands: number;
    } | {
        maxUsers: number;
        maxBrands: number;
    } | {
        maxUsers: number;
        maxBrands: number;
    } | {
        maxUsers: number;
        maxBrands: number;
    };
}
