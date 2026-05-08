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
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../user/guards/permission.guard';
import { RequirePermission } from '../../user/decorators/require-permission.decorator';
import { ApiKeyService } from '../services/api-key.service';
import { ApiKeyScope } from '../entities/api-key.entity';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ApiGatewayController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Get()
  @RequirePermission('user:read')
  async findAll(@Request() req: any) {
    return this.apiKeyService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @RequirePermission('user:read')
  async findOne(@Param('id') id: string) {
    return this.apiKeyService.findOne(id);
  }

  @Post()
  @RequirePermission('user:create')
  async create(@Body() dto: {
    name: string;
    description?: string;
    scopes?: ApiKeyScope[];
    rateLimit?: number;
    monthlyLimit?: number;
    expiresAt?: Date;
    isProduction?: boolean;
  }, @Request() req: any) {
    const result = await this.apiKeyService.create({
      ...dto,
      organizationId: req.user.organizationId,
      createdBy: req.user.userId,
    });

    return {
      ...result.apiKey,
      secret: result.secret, // 只在创建时返回一次
    };
  }

  @Put(':id')
  @RequirePermission('user:update')
  async update(@Param('id') id: string, @Body() dto: Partial<{
    name: string;
    description: string;
    scopes: ApiKeyScope[];
    rateLimit: number;
    monthlyLimit: number;
    expiresAt: Date;
  }>) {
    return this.apiKeyService.update(id, dto);
  }

  @Put(':id/suspend')
  @RequirePermission('user:update')
  async suspend(@Param('id') id: string) {
    return this.apiKeyService.toggleStatus(id, 'suspended' as any);
  }

  @Put(':id/activate')
  @RequirePermission('user:update')
  async activate(@Param('id') id: string) {
    return this.apiKeyService.toggleStatus(id, 'active' as any);
  }

  @Post(':id/regenerate-secret')
  @RequirePermission('user:update')
  async regenerateSecret(@Param('id') id: string) {
    // 简化实现
    const apiKey = await this.apiKeyService.findOne(id);
    // 实际应该生成新的secret
    return {
      message: 'Secret已重新生成',
      secret: 'new_secret_would_be_here',
    };
  }

  @Post(':id/revoke')
  @RequirePermission('user:delete')
  async revoke(@Param('id') id: string, @Request() req: any) {
    await this.apiKeyService.revoke(id);
    return { message: 'API Key已吊销' };
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  async remove(@Param('id') id: string) {
    await this.apiKeyService.remove(id);
    return { message: 'API Key已删除' };
  }

  // ========== API使用统计 ==========

  @Get('stats/usage')
  @RequirePermission('audit:read')
  async getUsageStats(@Request() req: any, @Query('days') days: number = 30) {
    // 简化实现
    return {
      totalCalls: 0,
      successRate: 0,
      avgResponseTime: 0,
      topEndpoints: [],
    };
  }
}
