import { Repository } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, ResetPasswordDto } from '../dto';
import { QueryUserDto } from '../dto/query.dto';
export declare class UserService {
    private userRepository;
    private roleRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    create(dto: CreateUserDto, organizationId: string, createdBy: string): Promise<User>;
    update(userId: string, dto: UpdateUserDto, updatedBy: string): Promise<User>;
    updatePassword(userId: string, dto: UpdatePasswordDto): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    findAll(query: QueryUserDto, organizationId: string): Promise<{
        users: User[];
        total: number;
    }>;
    findOne(userId: string): Promise<User>;
    remove(userId: string): Promise<void>;
    toggleStatus(userId: string, status: UserStatus): Promise<User>;
    validatePassword(email: string, password: string): Promise<User | null>;
    updateLastLogin(userId: string, ip: string): Promise<void>;
}
