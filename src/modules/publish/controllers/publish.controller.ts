import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { PublishService } from '../services/publish.service';
import { PublishContentDto, BatchPublishDto, QueryPublishDto, ExportContentDto } from '../dto/publish.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('内容发布')
@ApiBearerAuth()
@Controller('publish')
@UseGuards(JwtAuthGuard)
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  @Post('content')
  @ApiOperation({ summary: '发布内容到多平台' })
  @ApiResponse({ status: 201, description: '发布成功' })
  async publishContent(@Body() dto: PublishContentDto) {
    return this.publishService.publishContent(dto);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量发布内容' })
  @ApiResponse({ status: 201, description: '批量发布完成' })
  async batchPublish(@Body() dto: BatchPublishDto) {
    return this.publishService.batchPublish(dto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取发布记录列表' })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'contentType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPublishList(@Query() query: QueryPublishDto) {
    return this.publishService.getPublishList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取发布记录详情' })
  async getPublishById(@Param('id') id: string) {
    return this.publishService.getPublishById(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消发布' })
  async cancelPublish(@Param('id') id: string) {
    return this.publishService.cancelPublish(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: '重新发布' })
  async retryPublish(@Param('id') id: string) {
    return this.publishService.retryPublish(id);
  }

  @Post('copy/:contentId')
  @ApiOperation({ summary: '复制内容到剪贴板' })
  async copyContent(@Param('contentId') contentId: string) {
    return this.publishService.copyContent(contentId);
  }

  @Post('export')
  @ApiOperation({ summary: '导出内容' })
  async exportContent(@Body() dto: ExportContentDto) {
    return this.publishService.exportContent(dto);
  }

  @Get('platforms/status')
  @ApiOperation({ summary: '获取平台状态' })
  async getPlatformStatus() {
    return this.publishService.getPlatformStatus();
  }
}
