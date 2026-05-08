"use strict";
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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { UserService } from '../services/user.service';
import { OrganizationService } from '../services/organization.service';
import { AuditService } from '../services/audit.service';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, ResetPasswordDto } from '../dto';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';
import { QueryUserDto, QueryAuditLogDto } from '../dto/query.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private auditService: AuditService,
  ) {}

  // ========== 用户管理 ==========

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermission('user:read')
  async findAll(@Query() query: QueryUserDto, @Request() req: any) {
    const { organizationId } = req.user;
    return this.userService.findAll(query, organizationId);
  }

  @Get(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('user:read')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('user:create')
  async create(@Body() dto: CreateUserDto, @Request() req: any) {
    const { organizationId, userId } = req.user;
    
    // 检查用户数限制
    await this.organizationService.updateUserCount(organizationId, 1);
    
    const user = await this.userService.create(dto, organizationId, userId);
    
    await this.auditService.log({
      organizationId,
      userId,
      userName: req.user.name,
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      details: { email: user.email, role: dto.roleCode },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return user;
  }

  @Put(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('user:update')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req: any) {
    const { organizationId, userId, name } = req.user;
    
    const before = await this.userService.findOne(id);
    const user = await this.userService.update(id, dto, userId);
    
    await this.auditService.log({
      organizationId,
      userId,
      userName: name,
      action: 'update',
      resource: 'user',
      resourceId: id,
      before: { name: before.name, roleId: before.roleId },
      after: { name: user.name, roleId: user.roleId },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return user;
  }

  @Put(':id/password')
  @UseGuards(PermissionGuard)
  @RequirePermission('user:update')
  async updatePassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto, @Request() req: any) {
    await this.userService.updatePassword(id, dto);
    
    await this.auditService.log({
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      userName: req.user.name,
      action: 'update_password',
      resource: 'user',
      resourceId: id,
      details: { isSensitive: true },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: '密码已更新' };
  }

  @Put(':id/reset-password')
  @UseGuards(PermissionGuard)
  @RequirePermission('user:update')
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto, @Request() req: any) {
    await this.userService.resetPassword({ ...dto, userId: id });
    
    await this.auditService.log({
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      userName: req.user.name,
      action: 'reset_password',
      resource: 'user',
      resourceId: id,
      details: { isSensitive: true },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: '密码已重置' };
  }

  @Put(':id/status')
  @UseGuards(PermissionGuard)
  @RequirePermission('user:update')
  async toggleStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    const user = await this.userService.toggleStatus(id, status as any);
    
    await this.auditService.log({
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      userName: req.user.name,
      action: 'toggle_status',
      resource: 'user',
      resourceId: id,
      details: { status },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return user;
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('user:delete')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.userService.remove(id);
    
    await this.auditService.log({
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      userName: req.user.name,
      action: 'delete',
      resource: 'user',
      resourceId: id,
      details: { isSensitive: true },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: '用户已删除' };
  }

  // ========== 组织管理 ==========

  @Get('organization/profile')
  async getOrganization(@Request() req: any) {
    return this.organizationService.findOne(req.user.organizationId);
  }

  @Put('organization/profile')
  @UseGuards(PermissionGuard)
  @RequirePermission('org:update')
  async updateOrganization(@Body() dto: UpdateOrganizationDto, @Request() req: any) {
    const org = await this.organizationService.update(req.user.organizationId, dto);
    
    await this.auditService.log({
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      userName: req.user.name,
      action: 'update',
      resource: 'organization',
      resourceId: req.user.organizationId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return org;
  }

  // ========== 审计日志 ==========

  @Get('audit/logs')
  @UseGuards(PermissionGuard)
  @RequirePermission('audit:read')
  async getAuditLogs(@Query() query: QueryAuditLogDto, @Request() req: any) {
    const logsQuery = { ...query, organizationId: req.user.organizationId };
    return this.auditService.findAll(logsQuery);
  }

  @Get('audit/user-history/:userId')
  @UseGuards(PermissionGuard)
  @RequirePermission('audit:read')
  async getUserHistory(@Param('userId') userId: string, @Request() req: any) {
    return this.auditService.getUserHistory(userId);
  }

  @Get('audit/stats')
  @UseGuards(PermissionGuard)
  @RequirePermission('audit:read')
  async getAuditStats(@Query('days') days: number, @Request() req: any) {
    return this.auditService.getSensitiveStats(req.user.organizationId, days || 30);
  }
}
