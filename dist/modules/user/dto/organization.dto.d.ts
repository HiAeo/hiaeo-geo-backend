import { OrganizationType, OrganizationTier } from '../entities/organization.entity';
export declare class CreateOrganizationDto {
    name: string;
    shortName?: string;
    type: OrganizationType;
}
export declare class UpdateOrganizationDto {
    name?: string;
    shortName?: string;
    description?: string;
    logo?: string;
    website?: string;
    phone?: string;
    address?: string;
    tier?: OrganizationTier;
    settings?: Record<string, any>;
}
