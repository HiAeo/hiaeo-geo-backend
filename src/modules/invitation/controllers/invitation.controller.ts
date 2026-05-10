import { Controller, Get, Post, Body, Param, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { InvitationService } from '../services/invitation.service';

@ApiTags('邀请管理')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('code')
  @ApiOperation({ summary: '获取我的邀请码' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回邀请码信息' })
  async getMyInvitationCode(@Headers('x-user-id') userId: string) {
    return this.invitationService.getUserInvitationCode(userId);
  }

  @Post('generate')
  @ApiOperation({ summary: '生成邀请码' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 201, description: '返回邀请码信息' })
  async generateInvitationCode(@Headers('x-user-id') userId: string) {
    return this.invitationService.generateInvitationCode(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取邀请统计' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回邀请统计信息' })
  async getInvitationStats(@Headers('x-user-id') userId: string) {
    return this.invitationService.getInvitationStats(userId);
  }

  @Get()
  @ApiOperation({ summary: '获取邀请列表' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回邀请列表' })
  async getInvitations(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invitationService.getInvitations(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Post('use')
  @ApiOperation({ summary: '使用邀请码' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回邀请绑定结果' })
  async useInvitationCode(
    @Headers('x-user-id') userId: string,
    @Body('code') code: string,
  ) {
    return this.invitationService.useInvitationCode(code, userId);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: '验证邀请码' })
  @ApiResponse({ status: 200, description: '返回邀请码信息' })
  async validateInvitationCode(@Param('code') code: string) {
    return this.invitationService.getInvitationByCode(code);
  }
}
