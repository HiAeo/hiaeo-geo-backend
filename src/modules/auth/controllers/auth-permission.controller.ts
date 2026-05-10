import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission, RequirePermissions } from '../decorators/permission.decorator';
import { RoleService } from '../services/role.service';
import { PermissionService } from '../services/permission.service';
import { UserRoleService } from '../services/user-role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  SetKnowledgeScopeDto,
  CheckPermissionDto,
} from '../dto/role.dto';
import { PERMISSIONS } from '../constants/permissions.constant';

@Controller('v1/auth')
@UseGuards(JwtAuthGuard)
export class AuthPermissionController {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly userRoleService: UserRoleService,
  ) {}

  // ========== 角色管理 API ==========

  /**
   * 创建角色
   * POST /api/v1/auth/roles
   */
  @Post('roles')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.ROLE_MANAGE)
  async createRole(@Body() dto: CreateRoleDto) {
    const role = await this.roleService.createRole(dto);
    return { success: true, data: role };
  }

  /**
   * 获取角色列表
   * GET /api/v1/auth/roles
   */
  @Get('roles')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.ROLE_MANAGE)
  async getRoles(@Query('includeInactive') includeInactive?: string) {
    const roles = await this.roleService.getRoles(includeInactive === 'true');
    return { data: roles };
  }

  /**
   * 获取角色详情
   * GET /api/v1/auth/roles/:id
   */
  @Get('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.ROLE_MANAGE)
  async getRoleById(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.roleService.getRoleById(id);
    return { data: role };
  }

  /**
   * 更新角色
   * PUT /api/v1/auth/roles/:id
   */
  @Put('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.ROLE_MANAGE)
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const role = await this.roleService.updateRole(id, dto);
    return { success: true, data: role };
  }

  /**
   * 删除角色
   * DELETE /api/v1/auth/roles/:id
   */
  @Delete('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.ROLE_MANAGE)
  async deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    await this.roleService.deleteRole(id);
    return { success: true, message: '角色已删除' };
  }

  // ========== 权限管理 API ==========

  /**
   * 获取所有权限列表
   * GET /api/v1/auth/permissions
   */
  @Get('permissions')
  async getAllPermissions() {
    const permissions = await this.permissionService.getAllPermissions();
    return { data: permissions };
  }

  /**
   * 获取用户权限
   * GET /api/v1/auth/user/:userId/permissions
   */
  @Get('user/:userId/permissions')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USER_MANAGE)
  async getUserPermissions(@Param('userId', ParseUUIDPipe) userId: string) {
    const permissions = await this.permissionService.getUserPermissions(userId);
    const roles = await this.permissionService.getUserRoles(userId);
    return { data: { permissions, roles } };
  }

  /**
   * 获取我的权限
   * GET /api/v1/auth/my-permissions
   */
  @Get('my-permissions')
  async getMyPermissions(@Request() req: any) {
    const permissions = await this.permissionService.getUserPermissions(req.user.id);
    const roles = await this.permissionService.getUserRoles(req.user.id);
    return { data: { permissions, roles } };
  }

  // ========== 用户角色 API ==========

  /**
   * 分配角色
   * POST /api/v1/auth/users/:userId/roles
   */
  @Post('users/:userId/roles')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USER_MANAGE)
  async assignRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignRoleDto,
    @Request() req: any,
  ) {
    const userRole = await this.userRoleService.assignRole(
      userId,
      dto,
      req.user.id,
    );
    return { success: true, data: userRole };
  }

  /**
   * 撤销角色
   * DELETE /api/v1/auth/users/:userId/roles/:roleId
   */
  @Delete('users/:userId/roles/:roleId')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USER_MANAGE)
  async revokeRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    await this.userRoleService.revokeRole(userId, roleId);
    return { success: true, message: '角色已撤销' };
  }

  /**
   * 获取用户角色列表
   * GET /api/v1/auth/users/:userId/roles
   */
  @Get('users/:userId/roles')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USER_MANAGE)
  async getUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    const roles = await this.userRoleService.getUserRoles(userId);
    return { data: roles };
  }

  /**
   * 设置知识库访问范围
   * PUT /api/v1/auth/users/:userId/roles/scope
   */
  @Put('users/:userId/roles/scope')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USER_MANAGE)
  async setKnowledgeScope(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SetKnowledgeScopeDto,
  ) {
    const userRole = await this.userRoleService.setKnowledgeScope(userId, dto);
    return { success: true, data: userRole };
  }

  // ========== 权限检查 API ==========

  /**
   * 检查权限
   * POST /api/v1/auth/check-permission
   */
  @Post('check-permission')
  async checkPermission(
    @Body() dto: CheckPermissionDto,
    @Request() req: any,
  ) {
    const hasPermission = await this.permissionService.checkPermission(
      req.user.id,
      dto.permission,
      dto.resourceId,
    );
    return { data: { hasPermission } };
  }
}
