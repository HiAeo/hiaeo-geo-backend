/**
 * 向量数据库 API 控制器
 */

import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VectorHealthService } from '../../../services/vector-health.service';
import { VectorDbFactory } from '../../../services/vector-db-factory.service';
import { VectorStorageService } from '../services/vector-storage.service';

@ApiTags('向量数据库')
@Controller('v1/vector')
export class VectorController {
  constructor(
    private readonly healthService: VectorHealthService,
    private readonly storageService: VectorStorageService,
  ) {}

  /**
   * 健康检查
   */
  @Get('health')
  @ApiOperation({ summary: '向量数据库健康检查' })
  @ApiResponse({ status: 200, description: '健康状态' })
  async checkHealth() {
    return await this.healthService.checkHealth();
  }

  /**
   * 获取性能指标
   */
  @Get('metrics')
  @ApiOperation({ summary: '获取性能指标' })
  @ApiResponse({ status: 200, description: '性能指标' })
  async getMetrics() {
    return await this.healthService.getMetrics();
  }

  /**
   * 获取集合统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取集合统计' })
  @ApiQuery({ name: 'collection', required: false, description: '集合名称' })
  async getStats(@Query('collection') collection?: string) {
    return await this.healthService.getCollectionStats(collection || 'brand_knowledge_embeddings');
  }

  /**
   * 获取当前配置（脱敏）
   */
  @Get('config')
  @ApiOperation({ summary: '获取当前向量数据库配置' })
  @ApiResponse({ status: 200, description: '配置信息' })
  getConfig() {
    return VectorDbFactory.getSafeConfig();
  }

  /**
   * 获取存储统计
   */
  @Get('storage')
  @ApiOperation({ summary: '获取存储统计' })
  @ApiResponse({ status: 200, description: '存储统计' })
  async getStorageStats() {
    return await this.storageService.getStorageStats();
  }

  /**
   * 创建/重建集合
   */
  @Post('collection/rebuild')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重建集合索引' })
  @ApiResponse({ status: 200, description: '重建结果' })
  async rebuildCollection(@Body() body: { organizationIds?: string[] }) {
    if (body.organizationIds && body.organizationIds.length > 0) {
      return await this.storageService.batchIndex(body.organizationIds);
    }
    return { message: '请提供 organizationIds 列表' };
  }

  /**
   * 检查所有集合状态
   */
  @Get('collections')
  @ApiOperation({ summary: '检查所有集合状态' })
  @ApiResponse({ status: 200, description: '集合状态列表' })
  async checkAllCollections(@Query('collections') collections?: string) {
    const collectionNames = collections
      ? collections.split(',')
      : ['brand_knowledge_embeddings'];
    return await this.healthService.checkAllCollections(collectionNames);
  }
}
