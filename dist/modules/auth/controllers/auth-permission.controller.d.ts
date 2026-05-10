import { RoleService } from '../services/role.service';
import { PermissionService } from '../services/permission.service';
import { UserRoleService } from '../services/user-role.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, SetKnowledgeScopeDto, CheckPermissionDto } from '../dto/role.dto';
export declare class AuthPermissionController {
    private readonly roleService;
    private readonly permissionService;
    private readonly userRoleService;
    constructor(roleService: RoleService, permissionService: PermissionService, userRoleService: UserRoleService);
    createRole(dto: CreateRoleDto): Promise<{
        success: boolean;
        data: import("../entities").BrandRole;
    }>;
    getRoles(includeInactive?: string): Promise<{
        data: import("../entities").BrandRole[];
    }>;
    getRoleById(id: string): Promise<{
        data: import("../entities").BrandRole;
    }>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<{
        success: boolean;
        data: import("../entities").BrandRole;
    }>;
    deleteRole(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllPermissions(): Promise<{
        data: import("../entities").Permission[];
    }>;
    getUserPermissions(userId: string): Promise<{
        data: {
            permissions: string[];
            roles: import("../entities").BrandRole[];
        };
    }>;
    getMyPermissions(req: any): Promise<{
        data: {
            permissions: string[];
            roles: import("../entities").BrandRole[];
        };
    }>;
    assignRole(userId: string, dto: AssignRoleDto, req: any): Promise<{
        success: boolean;
        data: import("../entities").UserRole;
    }>;
    revokeRole(userId: string, roleId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserRoles(userId: string): Promise<{
        data: import("../entities").UserRole[];
    }>;
    setKnowledgeScope(userId: string, dto: SetKnowledgeScopeDto): Promise<{
        success: boolean;
        data: import("../entities").UserRole;
    }>;
    checkPermission(dto: CheckPermissionDto, req: any): Promise<{
        data: {
            hasPermission: boolean;
        };
    }>;
}
