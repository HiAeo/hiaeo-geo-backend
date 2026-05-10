import { UserRole } from './user-role.entity';
export declare class BrandRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem: boolean;
    level: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userRoles: UserRole[];
    hasPermission(permission: string): boolean;
}
