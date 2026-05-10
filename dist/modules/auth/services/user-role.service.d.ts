import { Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import { BrandRole } from '../entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { AssignRoleDto, SetKnowledgeScopeDto } from '../dto/role.dto';
export declare class UserRoleService {
    private readonly userRoleRepository;
    private readonly roleRepository;
    private readonly userRepository;
    private readonly logger;
    constructor(userRoleRepository: Repository<UserRole>, roleRepository: Repository<BrandRole>, userRepository: Repository<User>);
    assignRole(userId: string, dto: AssignRoleDto, grantedBy?: string): Promise<UserRole>;
    revokeRole(userId: string, roleId: string): Promise<void>;
    getUserRoles(userId: string): Promise<UserRole[]>;
    setKnowledgeScope(userId: string, dto: SetKnowledgeScopeDto): Promise<UserRole>;
    batchAssignRoles(userId: string, roleIds: string[], knowledgeScope?: string[], grantedBy?: string): Promise<UserRole[]>;
    removeAllRoles(userId: string): Promise<void>;
    hasRole(userId: string, roleName: string): Promise<boolean>;
}
