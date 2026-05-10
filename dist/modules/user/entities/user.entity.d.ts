import { Role } from './role.entity';
export declare enum UserStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    PENDING = "pending",
    DELETED = "deleted"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    avatar: string;
    status: string;
    organizationId: string;
    brandId: string;
    roleId: string;
    role: Role;
    profile: Record<string, any>;
    lastLoginAt: Date;
    lastLoginIp: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    passwordResetToken: string;
    passwordResetExpires: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isActive(): boolean;
    hasPermission(permission: string): boolean;
}
