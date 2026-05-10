import { Controller, Get, Post, Put, Delete, Body, Param, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { TeamService } from '../services/team.service';
import { TeamRole } from '../entities/team-member.entity';

@ApiTags('团队管理')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get(':organizationId/members')
  @ApiOperation({ summary: '获取团队成员列表' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回团队成员列表' })
  async getMembers(
    @Param('organizationId') organizationId: string,
    @Headers('x-user-id') userId: string,
  ) {
    // 验证用户是团队成员
    const role = await this.teamService.getMemberRole(organizationId, userId);
    if (!role) {
      return { message: '您不是团队成员', members: [] };
    }
    
    return this.teamService.getMembers(organizationId);
  }

  @Post(':organizationId/members')
  @ApiOperation({ summary: '添加团队成员' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addMember(
    @Param('organizationId') organizationId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: { targetUserId: string; role: TeamRole },
  ) {
    const operatorRole = await this.teamService.getMemberRole(organizationId, userId);
    if (!operatorRole) {
      return { message: '您不是团队成员' };
    }

    if (operatorRole !== TeamRole.OWNER && operatorRole !== TeamRole.ADMIN) {
      return { message: '只有管理员可以添加成员' };
    }

    return this.teamService.addMember(
      organizationId,
      body.targetUserId,
      body.role,
      userId,
    );
  }

  @Delete(':organizationId/members/:targetUserId')
  @ApiOperation({ summary: '移除团队成员' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '移除成功' })
  async removeMember(
    @Param('organizationId') organizationId: string,
    @Param('targetUserId') targetUserId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const operatorRole = await this.teamService.getMemberRole(organizationId, userId);
    if (!operatorRole) {
      return { message: '您不是团队成员' };
    }

    await this.teamService.removeMember(organizationId, targetUserId, operatorRole);
    return { success: true };
  }

  @Put(':organizationId/members/:targetUserId/role')
  @ApiOperation({ summary: '更新成员角色' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateMemberRole(
    @Param('organizationId') organizationId: string,
    @Param('targetUserId') targetUserId: string,
    @Headers('x-user-id') userId: string,
    @Body('role') role: TeamRole,
  ) {
    const operatorRole = await this.teamService.getMemberRole(organizationId, userId);
    if (!operatorRole) {
      return { message: '您不是团队成员' };
    }

    return this.teamService.updateMemberRole(
      organizationId,
      targetUserId,
      role,
      operatorRole,
    );
  }

  @Get(':organizationId/members/:targetUserId')
  @ApiOperation({ summary: '获取成员角色' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回成员角色' })
  async getMemberRole(
    @Param('organizationId') organizationId: string,
    @Param('targetUserId') targetUserId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const role = await this.teamService.getMemberRole(organizationId, targetUserId);
    return { role };
  }
}
