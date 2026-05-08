import { UserService } from '../services/user.service';
import { OrganizationService } from '../services/organization.service';
import { AuditService } from '../services/audit.service';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, ResetPasswordDto } from '../dto';
import { UpdateOrganizationDto } from '../dto/organization.dto';
import { QueryUserDto, QueryAuditLogDto } from '../dto/query.dto';
export declare class UserController {
    private userService;
    private organizationService;
    private auditService;
    constructor(userService: UserService, organizationService: OrganizationService, auditService: AuditService);
    findAll(query: QueryUserDto, req: any): Promise<{
        users: import("../entities").User[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../entities").User>;
    create(dto: CreateUserDto, req: any): Promise<import("../entities").User>;
    update(id: string, dto: UpdateUserDto, req: any): Promise<import("../entities").User>;
    updatePassword(id: string, dto: UpdatePasswordDto, req: any): Promise<{
        message: string;
    }>;
    resetPassword(id: string, dto: ResetPasswordDto, req: any): Promise<{
        message: string;
    }>;
    toggleStatus(id: string, status: string, req: any): Promise<import("../entities").User>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    getOrganization(req: any): Promise<import("../entities").Organization>;
    updateOrganization(dto: UpdateOrganizationDto, req: any): Promise<import("../entities").Organization>;
    getAuditLogs(query: QueryAuditLogDto, req: any): Promise<{
        logs: import("../entities").AuditLog[];
        total: number;
    }>;
    getUserHistory(userId: string, req: any): Promise<import("../entities").AuditLog[]>;
    getAuditStats(days: number, req: any): Promise<Record<string, number>>;
}
