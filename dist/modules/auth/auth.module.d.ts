import { OnModuleInit } from '@nestjs/common';
import { RoleService } from './services/role.service';
export declare class AuthModule implements OnModuleInit {
    private readonly roleService;
    constructor(roleService: RoleService);
    onModuleInit(): Promise<void>;
}
