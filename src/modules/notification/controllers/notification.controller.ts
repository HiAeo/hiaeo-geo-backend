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
import { NotificationService } from '../services/notification.service';
import { NotificationType, NotificationChannel, NotificationStatus } from '../entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.findAll(req.user.userId, {
      type,
      status,
      unreadOnly: unreadOnly === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('preferences')
  async getPreferences(@Request() req: any) {
    return this.notificationService.getPreferences(req.user.userId);
  }

  @Put('preferences')
  async updatePreferences(
    @Body() dto: {
      emailEnabled?: boolean;
      emailTypes?: string[];
      smsEnabled?: boolean;
      smsTypes?: string[];
      quietHoursStart?: string;
      quietHoursEnd?: string;
      quietHoursEnabled?: boolean;
      marketingEnabled?: boolean;
      aggregationMode?: 'realtime' | 'hourly' | 'daily';
    },
    @Request() req: any,
  ) {
    return this.notificationService.updatePreferences(req.user.userId, dto);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationService.markAsRead(id, req.user.userId);
    return { message: '已标记为已读' };
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    await this.notificationService.markAllAsRead(req.user.userId);
    return { message: '全部标记为已读' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.notificationService.delete(id, req.user.userId);
    return { message: '通知已删除' };
  }

  // ========== 管理接口 ==========

  @Post('send')
  async sendNotification(
    @Body() dto: {
      userId: string;
      userName: string;
      title: string;
      content: string;
      type: NotificationType;
      channels?: NotificationChannel[];
      actionUrl?: string;
      actionText?: string;
    },
    @Request() req: any,
  ) {
    const notifications = await this.notificationService.send({
      ...dto,
      organizationId: req.user.organizationId,
    });
    return { message: '通知已发送', count: notifications.length };
  }

  @Post('send-bulk')
  async sendBulk(
    @Body() dto: {
      userIds: string[];
      title: string;
      content: string;
      type: NotificationType;
      channels?: NotificationChannel[];
    },
    @Request() req: any,
  ) {
    const count = await this.notificationService.sendBulk({
      ...dto,
    });
    return { message: '批量通知已发送', count };
  }
}
