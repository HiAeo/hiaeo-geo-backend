import { Repository } from 'typeorm';
import { BrandRole } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
export declare class RoleService {
    private readonly roleRepository;
    private readonly permissionRepository;
    private readonly logger;
    constructor(roleRepository: Repository<BrandRole>, permissionRepository: Repository<Permission>);
    createRole(dto: CreateRoleDto): Promise<BrandRole>;
    getRoles(includeInactive?: boolean): Promise<BrandRole[]>;
    getRoleById(id: string): Promise<BrandRole>;
    getRoleByName(name: string): Promise<BrandRole | null>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<BrandRole>;
    deleteRole(id: string): Promise<void>;
    initDefaultRoles(): Promise<void>;
}
