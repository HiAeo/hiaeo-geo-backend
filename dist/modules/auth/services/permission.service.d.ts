import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { BrandRole } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { User } from '../../user/entities/user.entity';
export declare class PermissionService {
    private readonly permissionRepository;
    private readonly roleRepository;
    private readonly userRoleRepository;
    private readonly userRepository;
    private readonly logger;
    constructor(permissionRepository: Repository<Permission>, roleRepository: Repository<BrandRole>, userRoleRepository: Repository<UserRole>, userRepository: Repository<User>);
    checkPermission(userId: string, permission: string, resourceId?: string): Promise<boolean>;
    checkKnowledgeAccess(userId: string, knowledgeId: string): Promise<boolean>;
    getUserPermissions(userId: string): Promise<string[]>;
    getUserRoles(userId: string): Promise<BrandRole[]>;
    getAllPermissions(): Promise<Permission[]>;
    getPermissionsByModule(module: string): Promise<Permission[]>;
}
