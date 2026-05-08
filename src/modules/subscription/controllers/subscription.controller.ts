import { Controller, Get, Post, Put, Body, Param, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { SubscriptionService } from '../services/subscription.service';
import { BillingCycle } from '../../package/entities/package.entity';

class CreateSubscriptionDto {
  packageId: string;
  billingCycle?: BillingCycle;
}

class UpgradeSubscriptionDto {
  newPackageId: string;
}

@ApiTags('订阅管理')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('current')
  @ApiOperation({ summary: '获取当前订阅' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回当前订阅信息' })
  async getCurrentSubscription(@Headers('x-user-id') userId: string) {
    return this.subscriptionService.getCurrentSubscription(userId);
  }

  @Get('history')
  @ApiOperation({ summary: '获取订阅历史' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回订阅历史' })
  async getSubscriptionHistory(@Headers('x-user-id') userId: string) {
    return this.subscriptionService.getSubscriptionHistory(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订阅详情' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回订阅详情' })
  async getSubscriptionById(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.subscriptionService.getSubscriptionById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建订阅' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 201, description: '订阅创建成功' })
  async createSubscription(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createSubscription({
      userId,
      packageId: dto.packageId,
      billingCycle: dto.billingCycle,
    });
  }

  @Put('upgrade')
  @ApiOperation({ summary: '升级订阅' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '订阅升级成功' })
  async upgradeSubscription(
    @Headers('x-user-id') userId: string,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionService.upgradeSubscription(userId, dto.newPackageId);
  }

  @Put('renew')
  @ApiOperation({ summary: '续费订阅' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '订阅续费成功' })
  async renewSubscription(@Headers('x-user-id') userId: string) {
    return this.subscriptionService.renewSubscription(userId);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订阅' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '订阅取消成功' })
  async cancelSubscription(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.subscriptionService.cancelSubscription(id, reason);
  }

  @Put(':id/suspend')
  @ApiOperation({ summary: '暂停订阅' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '订阅暂停成功' })
  async suspendSubscription(@Param('id') id: string) {
    return this.subscriptionService.suspendSubscription(id);
  }

  @Put(':id/resume')
  @ApiOperation({ summary: '恢复订阅' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '订阅恢复成功' })
  async resumeSubscription(@Param('id') id: string) {
    return this.subscriptionService.resumeSubscription(id);
  }

  @Put(':id/auto-renew')
  @ApiOperation({ summary: '设置自动续费' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setAutoRenew(
    @Param('id') id: string,
    @Body('autoRenew') autoRenew: boolean,
  ) {
    return this.subscriptionService.setAutoRenew(id, autoRenew);
  }

  @Put(':id/usage')
  @ApiOperation({ summary: '更新使用量' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateUsage(
    @Param('id') id: string,
    @Body('increment') increment?: number,
  ) {
    return this.subscriptionService.updateUsage(id, increment || 1);
  }
}
