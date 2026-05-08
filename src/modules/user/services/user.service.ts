"use strict";
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../entities/user.entity';
import { Role, RoleType, RolePermissions } from '../entities/role.entity';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, ResetPasswordDto } from '../dto';
import { QueryUserDto } from '../dto/query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * 创建用户
   */
  async create(dto: CreateUserDto, organizationId: string, createdBy: string): Promise<User> {
    // 检查邮箱是否已存在
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // 获取角色
    const role = await this.roleRepository.findOne({ where: { code: dto.roleCode } });
    if (!role) {
      throw new BadRequestException('无效的角色');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      organizationId,
      roleId: role.id,
      status: UserStatus.ACTIVE,
      createdBy,
    });

    return this.userRepository.save(user);
  }

  /**
   * 更新用户
   */
  async update(userId: string, dto: UpdateUserDto, updatedBy: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.roleCode) {
      const role = await this.roleRepository.findOne({ where: { code: dto.roleCode } });
      if (!role) {
        throw new BadRequestException('无效的角色');
      }
      user.roleId = role.id;
    }

    if (dto.name) user.name = dto.name;
    if (dto.phone) user.phone = dto.phone;
    if (dto.avatar) user.avatar = dto.avatar;
    if (dto.profile) user.profile = dto.profile;
    user.updatedBy = updatedBy;

    return this.userRepository.save(user);
  }

  /**
   * 更新密码
   */
  async updatePassword(userId: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
  }

  /**
   * 重置密码
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
  }

  /**
   * 查询用户列表
   */
  async findAll(query: QueryUserDto, organizationId: string): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.organizationId = :organizationId', { organizationId })
      .andWhere('user.status != :deletedStatus', { deletedStatus: UserStatus.DELETED });

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

  /**
   * 获取单个用户
   */
  async findOne(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 删除用户（软删除）
   */
  async remove(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.status = UserStatus.DELETED;
    await this.userRepository.save(user);
  }

  /**
   * 启用/禁用用户
   */
  async toggleStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  /**
   * 验证用户密码
   */
  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
      relations: ['role'],
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
  }

  /**
   * 更新最后登录信息
   */
  async updateLastLogin(userId: string, ip: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }
}
