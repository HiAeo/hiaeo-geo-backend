import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BrandRole } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { SYSTEM_ROLES, DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '../constants/permissions.constant';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(BrandRole)
    private readonly roleRepository: Repository<BrandRole>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 创建角色
   */
  async createRole(dto: CreateRoleDto): Promise<BrandRole> {
    // 检查角色名是否已存在
    const existing = await this.roleRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(`角色 ${dto.name} 已存在`);
    }

    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
      permissions: dto.permissions || [],
      isSystem: dto.isSystem || false,
      level: dto.level || 0,
      isActive: true,
    });

    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`角色 ${savedRole.name} 创建成功`);
    return savedRole;
  }

  /**
   * 获取所有角色
   */
  async getRoles(includeInactive = false): Promise<BrandRole[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.roleRepository.find({
      where,
      order: { level: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * 根据ID获取角色
   */
  async getRoleById(id: string): Promise<BrandRole> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`角色不存在`);
    }
    return role;
  }

  /**
   * 根据名称获取角色
   */
  async getRoleByName(name: string): Promise<BrandRole | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, dto: UpdateRoleDto): Promise<BrandRole> {
    const role = await this.getRoleById(id);

    // 系统内置角色不能修改名称
    if (role.isSystem && dto.name && dto.name !== role.name) {
      throw new BadRequestException('系统内置角色不能修改名称');
    }

    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.permissions !== undefined) role.permissions = dto.permissions;
    if (dto.isActive !== undefined) role.isActive = dto.isActive;
    if (dto.level !== undefined) role.level = dto.level;

    const updatedRole = await this.roleRepository.save(role);
    this.logger.log(`角色 ${updatedRole.name} 更新成功`);
    return updatedRole;
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);

    if (role.isSystem) {
      throw new BadRequestException('系统内置角色不能删除');
    }

    await this.roleRepository.remove(role);
    this.logger.log(`角色 ${role.name} 删除成功`);
  }

  /**
   * 初始化默认角色
   */
  async initDefaultRoles(): Promise<void> {
    const existingRoles = await this.roleRepository.find({
      where: { isSystem: true },
    });

    if (existingRoles.length > 0) {
      this.logger.log('系统角色已存在，跳过初始化');
      return;
    }

    this.logger.log('开始初始化系统角色...');

    // 创建所有权限定义
    const permissionList = [
      { code: PERMISSIONS.KNOWLEDGE_READ, name: '查看知识库', module: 'KNOWLEDGE', description: '查看知识库内容' },
      { code: PERMISSIONS.KNOWLEDGE_WRITE, name: '编辑知识库', module: 'KNOWLEDGE', description: '创建和编辑知识库内容' },
      { code: PERMISSIONS.KNOWLEDGE_DELETE, name: '删除知识库', module: 'KNOWLEDGE', description: '删除知识库' },
      { code: PERMISSIONS.KNOWLEDGE_AUDIT, name: '审核知识库', module: 'KNOWLEDGE', description: '审核知识库变更' },
      { code: PERMISSIONS.WORKFLOW_READ, name: '查看工作流', module: 'WORKFLOW', description: '查看工作流' },
      { code: PERMISSIONS.WORKFLOW_WRITE, name: '编辑工作流', module: 'WORKFLOW', description: '创建和编辑工作流' },
      { code: PERMISSIONS.WORKFLOW_EXECUTE, name: '执行工作流', module: 'WORKFLOW', description: '执行工作流' },
      { code: PERMISSIONS.CONTENT_READ, name: '查看内容', module: 'CONTENT', description: '查看内容' },
      { code: PERMISSIONS.CONTENT_WRITE, name: '编辑内容', module: 'CONTENT', description: '创建和编辑内容' },
      { code: PERMISSIONS.USER_MANAGE, name: '用户管理', module: 'USER', description: '管理系统用户' },
      { code: PERMISSIONS.ROLE_MANAGE, name: '角色管理', module: 'ROLE', description: '管理角色和权限' },
      { code: PERMISSIONS.AUDIT_VIEW, name: '查看审计日志', module: 'AUDIT', description: '查看审计日志' },
      { code: PERMISSIONS.BRAND_READ, name: '查看品牌', module: 'BRAND', description: '查看品牌信息' },
      { code: PERMISSIONS.BRAND_WRITE, name: '编辑品牌', module: 'BRAND', description: '编辑品牌信息' },
      { code: PERMISSIONS.STRATEGY_READ, name: '查看策略', module: 'STRATEGY', description: '查看推广策略' },
      { code: PERMISSIONS.STRATEGY_WRITE, name: '编辑策略', module: 'STRATEGY', description: '编辑推广策略' },
      { code: PERMISSIONS.PUBLISH_READ, name: '查看发布', module: 'PUBLISH', description: '查看发布内容' },
      { code: PERMISSIONS.PUBLISH_EXECUTE, name: '执行发布', module: 'PUBLISH', description: '执行发布操作' },
    ];

    // 保存权限
    for (const permData of permissionList) {
      const existing = await this.permissionRepository.findOne({
        where: { code: permData.code },
      });
      if (!existing) {
        const permission = this.permissionRepository.create(permData);
        await this.permissionRepository.save(permission);
      }
    }

    // 创建系统角色
    const roleConfigs = [
      {
        name: SYSTEM_ROLES.ADMIN,
        description: '管理员 - 拥有系统全部权限',
        permissions: DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.ADMIN],
        level: 100,
      },
      {
        name: SYSTEM_ROLES.EDITOR,
        description: '编辑 - 可以查看和编辑知识库和内容',
        permissions: DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.EDITOR],
        level: 50,
      },
      {
        name: SYSTEM_ROLES.VIEWER,
        description: '查看者 - 仅可查看知识库和内容',
        permissions: DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.VIEWER],
        level: 10,
      },
      {
        name: SYSTEM_ROLES.GUEST,
        description: '访客 - 只读权限，受知识库范围限制',
        permissions: DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.GUEST],
        level: 1,
      },
    ];

    for (const config of roleConfigs) {
      const existing = await this.roleRepository.findOne({
        where: { name: config.name },
      });
      if (!existing) {
        const role = this.roleRepository.create({
          ...config,
          isSystem: true,
          isActive: true,
        });
        await this.roleRepository.save(role);
        this.logger.log(`系统角色 ${config.name} 创建成功`);
      }
    }

    this.logger.log('系统角色初始化完成');
  }
}
