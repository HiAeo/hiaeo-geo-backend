import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { BrandRole } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(BrandRole)
    private readonly roleRepository: Repository<BrandRole>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 检查用户是否拥有指定权限
   */
  async checkPermission(userId: string, permission: string, resourceId?: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      return false;
    }

    // 如果用户是超级管理员，直接返回 true
    if (user.role?.code === 'super_admin') {
      return true;
    }

    // 获取用户的所有品牌角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    // 过滤掉已过期的角色
    const validRoles = userRoles.filter(ur => !ur.isExpired());

    for (const userRole of validRoles) {
      if (userRole.role?.hasPermission(permission)) {
        // 如果指定了资源ID，检查知识库范围
        if (resourceId) {
          if (userRole.canAccessKnowledge(resourceId)) {
            return true;
          }
        } else {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查用户是否可以访问指定知识库
   */
  async checkKnowledgeAccess(userId: string, knowledgeId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      return false;
    }

    // 如果用户是超级管理员，直接返回 true
    if (user.role?.code === 'super_admin') {
      return true;
    }

    // 获取用户的所有品牌角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    // 过滤掉已过期的角色
    const validRoles = userRoles.filter(ur => !ur.isExpired());

    for (const userRole of validRoles) {
      // ADMIN 角色可以访问所有知识库
      if (userRole.role?.name === 'ADMIN') {
        return true;
      }
      // 检查知识库范围
      if (userRole.canAccessKnowledge(knowledgeId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取用户的所有权限
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      return [];
    }

    // 如果用户是超级管理员，返回所有权限
    if (user.role?.code === 'super_admin') {
      const allPermissions = await this.permissionRepository.find({
        where: { isActive: true },
      });
      return allPermissions.map(p => p.code);
    }

    // 获取用户的所有品牌角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    // 过滤掉已过期的角色，合并所有权限
    const validRoles = userRoles.filter(ur => !ur.isExpired());
    const permissionsSet = new Set<string>();

    for (const userRole of validRoles) {
      if (userRole.role?.permissions) {
        userRole.role.permissions.forEach(p => permissionsSet.add(p));
      }
    }

    return Array.from(permissionsSet);
  }

  /**
   * 获取用户的品牌角色
   */
  async getUserRoles(userId: string): Promise<BrandRole[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    // 过滤掉已过期的角色
    const validRoles = userRoles.filter(ur => !ur.isExpired());
    return validRoles.map(ur => ur.role).filter(Boolean) as BrandRole[];
  }

  /**
   * 获取所有权限列表
   */
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { isActive: true },
      order: { module: 'ASC', code: 'ASC' },
    });
  }

  /**
   * 按模块获取权限
   */
  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { module, isActive: true },
      order: { code: 'ASC' },
    });
  }
}
