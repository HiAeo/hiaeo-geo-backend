import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../user/services/user.service';
import { User } from '../user/entities/user.entity';
import { Organization } from '../user/entities/organization.entity';
import { Role } from '../user/entities/role.entity';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly userService;
    private readonly userRepository;
    private readonly organizationRepository;
    private readonly roleRepository;
    private readonly logger;
    private readonly accessTokenExpiration;
    private readonly refreshTokenExpiration;
    constructor(jwtService: JwtService, configService: ConfigService, userService: UserService, userRepository: Repository<User>, organizationRepository: Repository<Organization>, roleRepository: Repository<Role>);
    login(dto: LoginDto, ip?: string): Promise<AuthResponseDto>;
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    validateToken(token: string): Promise<User>;
    getProfile(userId: string): Promise<UserInfoDto>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    sendPasswordResetEmail(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
