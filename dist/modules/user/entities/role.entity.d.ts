import { User } from './user.entity';
export declare enum RoleType {
    SUPER_ADMIN = "super_admin",
    ORG_ADMIN = "org_admin",
    BRAND_ADMIN = "brand_admin",
    EDITOR = "editor",
    VIEWER = "viewer"
}
export declare const RolePermissions: {
    super_admin: string[];
    org_admin: string[];
    brand_admin: string[];
    editor: string[];
    viewer: string[];
};
export declare class Role {
    id: string;
    code: RoleType;
    name: string;
    description: string;
    permissions: string[];
    level: number;
    isActive: boolean;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
    hasPermission(permission: string): boolean;
    static getRoleDescription(code: RoleType): string;
}
