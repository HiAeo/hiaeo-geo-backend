import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private userRepository;
    private roleRepository;
    constructor(reflector: Reflector, userRepository: Repository<User>, roleRepository: Repository<Role>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
