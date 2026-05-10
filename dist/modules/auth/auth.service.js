"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_service_1 = require("../../config/config.service");
const user_service_1 = require("../user/services/user.service");
const user_entity_1 = require("../user/entities/user.entity");
const organization_entity_1 = require("../user/entities/organization.entity");
const role_entity_1 = require("../user/entities/role.entity");
const bcrypt = __importStar(require("bcryptjs"));
const auth_response_dto_1 = require("./dto/auth-response.dto");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, configService, userService, userRepository, organizationRepository, roleRepository) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.accessTokenExpiration = 604800;
        this.refreshTokenExpiration = 604800 * 30;
    }
    async login(dto, ip) {
        const user = await this.userService.validatePassword(dto.email, dto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        if (user.status !== user_entity_1.UserStatus.ACTIVE) {
            throw new common_1.ForbiddenException('账号已被停用或未激活');
        }
        if (ip) {
            await this.userService.updateLastLogin(user.id, ip);
        }
        return this.generateTokens(user);
    }
    async register(dto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('该邮箱已被注册');
        }
        let organization = await this.organizationRepository.findOne({
            where: { name: `${dto.name}的团队` },
        });
        if (!organization) {
            organization = this.organizationRepository.create({
                name: `${dto.name}的团队`,
                type: organization_entity_1.OrganizationType.INDIVIDUAL,
            });
            organization = await this.organizationRepository.save(organization);
        }
        const defaultRole = await this.roleRepository.findOne({
            where: { code: role_entity_1.RoleType.VIEWER },
        });
        if (!defaultRole) {
            throw new common_1.BadRequestException('系统角色配置错误');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.userRepository.create({
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
            phone: dto.phone,
            organizationId: organization.id,
            roleId: defaultRole.id,
            status: user_entity_1.UserStatus.ACTIVE,
            emailVerified: false,
            createdBy: '',
        });
        await this.userRepository.save(user);
        const fullUser = await this.userService.findOne(user.id);
        return this.generateTokens(fullUser);
    }
    async refreshToken(dto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.getJwtSecret(),
            });
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('无效的刷新令牌');
            }
            const user = await this.userService.findOne(payload.sub);
            if (!user || user.status !== user_entity_1.UserStatus.ACTIVE) {
                throw new common_1.UnauthorizedException('用户不存在或已被停用');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('刷新令牌已过期或无效');
        }
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.getJwtSecret(),
            });
            if (payload.type !== 'access') {
                throw new common_1.UnauthorizedException('无效的访问令牌');
            }
            const user = await this.userService.findOne(payload.sub);
            if (!user || user.status !== user_entity_1.UserStatus.ACTIVE) {
                throw new common_1.UnauthorizedException('用户不存在或已被停用');
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('令牌无效或已过期');
        }
    }
    async getProfile(userId) {
        const user = await this.userService.findOne(userId);
        return auth_response_dto_1.UserInfoDto.fromUser(user);
    }
    async changePassword(userId, dto) {
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.BadRequestException('原密码错误');
        }
        const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
        if (isSamePassword) {
            throw new common_1.BadRequestException('新密码不能与原密码相同');
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await this.userRepository.save(user);
        return { message: '密码修改成功' };
    }
    async sendPasswordResetEmail(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return { message: '如果邮箱存在，密码重置邮件已发送' };
        }
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000);
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await this.userRepository.save(user);
        this.logger.log(`密码重置令牌已生成: ${email}`);
        return { message: '如果邮箱存在，密码重置邮件已发送' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: {
                passwordResetToken: token,
                passwordResetExpires: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('重置链接已过期或无效');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await this.userRepository.save(user);
        return { message: '密码重置成功' };
    }
    generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            role: user.role?.code || '',
            type: 'access',
        };
        const refreshPayload = {
            ...payload,
            type: 'refresh',
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.getJwtExpiration() || '7d',
        });
        const refreshToken = this.jwtService.sign(refreshPayload, {
            expiresIn: '30d',
        });
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: this.accessTokenExpiration,
            user: auth_response_dto_1.UserInfoDto.fromUser(user),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(5, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_service_1.ConfigService,
        user_service_1.UserService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map