import { RoleType } from '../entities/role.entity';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
    avatar?: string;
    roleCode: RoleType;
    brandId?: string;
    profile?: Record<string, any>;
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    avatar?: string;
    roleCode?: RoleType;
    profile?: Record<string, any>;
}
export declare class UpdatePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class ResetPasswordDto {
    userId: string;
    newPassword: string;
}
