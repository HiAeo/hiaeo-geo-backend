import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import { BrandRole } from '../entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { AssignRoleDto, SetKnowledgeScopeDto } from '../dto/role.dto';

@Injectable()
export class UserRoleService {
  private readonly logger = new Logger(UserRoleService.name);

  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(BrandRole)
    private readonly roleRepository: Repository<BrandRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 分配角色给用户
   */
  async assignRole(
    userId: string,
    dto: AssignRoleDto,
    grantedBy?: string,
  ): Promise<UserRole> {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查角色是否存在
    const role = await this.roleRepository.findOne({
      where: { id: dto.roleId, isActive: true },
    });
    if (!role) {
      throw new NotFoundException('角色不存在或已停用');
    }

    // 检查用户是否已经拥有该角色
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId: dto.roleId },
    });
    if (existing) {
      throw new BadRequestException('用户已拥有该角色');
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId: dto.roleId,
      knowledgeScope: dto.knowledgeScope || [],
      expiresAt: dto.expiresAt,
      grantedBy,
    });

    const savedUserRole = await this.userRoleRepository.save(userRole);
    this.logger.log(`角色 ${role.name} 已分配给用户 ${userId}`);
    return savedUserRole;
  }

  /**
   * 撤销用户的角色
   */
  async revokeRole(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (!userRole) {
      throw new NotFoundException('用户没有该角色');
    }

    await this.userRoleRepository.remove(userRole);
    this.logger.log(`角色 ${roleId} 已从用户 ${userId} 撤销`);
  }

  /**
   * 获取用户的所有角色关联
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 设置用户的知识库访问范围
   */
  async setKnowledgeScope(
    userId: string,
    dto: SetKnowledgeScopeDto,
  ): Promise<UserRole> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId: dto.roleId },
    });

    if (!userRole) {
      throw new NotFoundException('用户没有该角色');
    }

    userRole.knowledgeScope = dto.knowledgeIds;
    const updated = await this.userRoleRepository.save(userRole);
    this.logger.log(`用户 ${userId} 的角色 ${dto.roleId} 知识库范围已更新`);
    return updated;
  }

  /**
   * 批量分配角色
   */
  async batchAssignRoles(
    userId: string,
    roleIds: string[],
    knowledgeScope?: string[],
    grantedBy?: string,
  ): Promise<UserRole[]> {
    const results: UserRole[] = [];

    for (const roleId of roleIds) {
      try {
        const dto: AssignRoleDto = {
          roleId,
          knowledgeScope,
        };
        const userRole = await this.assignRole(userId, dto, grantedBy);
        results.push(userRole);
      } catch (error) {
        // 跳过已存在的角色
        if (error instanceof BadRequestException) {
          this.logger.warn(`跳过已存在的角色: ${roleId}`);
          continue;
        }
        throw error;
      }
    }

    return results;
  }

  /**
   * 移除用户的所有角色
   */
  async removeAllRoles(userId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId });
    this.logger.log(`用户 ${userId} 的所有角色已移除`);
  }

  /**
   * 检查用户是否有特定角色
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    const validRoles = userRoles.filter(ur => !ur.isExpired());
    return validRoles.some(ur => ur.role?.name === roleName);
  }
}
