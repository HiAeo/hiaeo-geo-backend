import { UserStatus } from '../entities/user.entity';
export declare class QueryUserDto {
    organizationId?: string;
    brandId?: string;
    status?: UserStatus;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class QueryAuditLogDto {
    organizationId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    action?: string;
    resource?: string;
    page?: number;
    limit?: number;
}
