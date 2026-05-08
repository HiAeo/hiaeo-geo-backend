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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
let UserService = class UserService {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async create(dto, organizationId, createdBy) {
        const existing = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.BadRequestException('该邮箱已被注册');
        }
        const role = await this.roleRepository.findOne({ where: { code: dto.roleCode } });
        if (!role) {
            throw new common_1.BadRequestException('无效的角色');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.userRepository.create({
            ...dto,
            password: hashedPassword,
            organizationId,
            roleId: role.id,
            status: user_entity_1.UserStatus.ACTIVE,
            createdBy,
        });
        return this.userRepository.save(user);
    }
    async update(userId, dto, updatedBy) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (dto.roleCode) {
            const role = await this.roleRepository.findOne({ where: { code: dto.roleCode } });
            if (!role) {
                throw new common_1.BadRequestException('无效的角色');
            }
            user.roleId = role.id;
        }
        if (dto.name)
            user.name = dto.name;
        if (dto.phone)
            user.phone = dto.phone;
        if (dto.avatar)
            user.avatar = dto.avatar;
        if (dto.profile)
            user.profile = dto.profile;
        user.updatedBy = updatedBy;
        return this.userRepository.save(user);
    }
    async updatePassword(userId, dto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('原密码错误');
        }
        user.password = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.save(user);
    }
    async resetPassword(dto) {
        const user = await this.userRepository.findOne({ where: { id: dto.userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        user.password = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.save(user);
    }
    async findAll(query, organizationId) {
        const { page = 1, limit = 20, status, search } = query;
        const skip = (page - 1) * limit;
        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.organizationId = :organizationId', { organizationId })
            .andWhere('user.status != :deletedStatus', { deletedStatus: user_entity_1.UserStatus.DELETED });
        if (status) {
            queryBuilder.andWhere('user.status = :status', { status });
        }
        if (search) {
            queryBuilder.andWhere('(user.name LIKE :search OR user.email LIKE :search)', {
                search: `%${search}%`,
            });
        }
        const [users, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('user.createdAt', 'DESC')
            .getManyAndCount();
        return { users, total };
    }
    async findOne(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return user;
    }
    async remove(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        user.status = user_entity_1.UserStatus.DELETED;
        await this.userRepository.save(user);
    }
    async toggleStatus(userId, status) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        user.status = status;
        return this.userRepository.save(user);
    }
    async validatePassword(email, password) {
        const user = await this.userRepository.findOne({
            where: { email, status: user_entity_1.UserStatus.ACTIVE },
            relations: ['role'],
        });
        if (!user)
            return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            return null;
        return user;
    }
    async updateLastLogin(userId, ip) {
        await this.userRepository.update(userId, {
            lastLoginAt: new Date(),
            lastLoginIp: ip,
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map