import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VectorService } from '../services/vector.service';
import { VectorSearchRequest, VectorUpsertRequest } from '../interfaces/vector.interface';

@ApiTags('Vector - 向量数据库')
@ApiBearerAuth()
@Controller('v1/vector')
export class VectorController {
  constructor(private readonly vectorService: VectorService) {}

  /**
   * 搜索相似内容
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '向量搜索' })
  async search(
    @Body() body: { query: string; brandId?: string; topK?: number },
  ): Promise<{
    success: boolean;
    results: any[];
    error?: string;
  }> {
    return this.vectorService.search(body.query, {
      brandId: body.brandId,
      topK: body.topK || 10,
    });
  }

  /**
   * 存储品牌知识
   */
  @Post('knowledge')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '存储品牌知识到向量库' })
  async storeKnowledge(@Body() body: {
    brandId: string;
    title: string;
    content: string;
    source?: string;
    type?: string;
  }): Promise<{
    success: boolean;
    id?: string;
    error?: string;
  }> {
    return this.vectorService.storeBrandKnowledge(body);
  }

  /**
   * RAG 检索
   */
  @Post('rag')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'RAG 检索（结合上下文）' })
  async ragRetrieve(@Body() body: {
    query: string;
    brandId: string;
    topK?: number;
  }): Promise<{
    success: boolean;
    context: string;
    sources: { title: string; score: number }[];
    error?: string;
  }> {
    return this.vectorService.ragRetrieve(body.query, body.brandId, body.topK || 5);
  }

  /**
   * 获取统计信息
   */
  @Get('stats')
  @ApiOperation({ summary: '获取向量库统计' })
  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
    namespaces: string[];
  }> {
    return this.vectorService.getStats();
  }

  /**
   * 检查服务状态
   */
  @Get('status')
  @ApiOperation({ summary: '检查向量数据库状态' })
  async getStatus(): Promise<{
    available: boolean;
    engine: string;
  }> {
    return {
      available: this.vectorService.isAvailable(),
      engine: this.vectorService.isAvailable() ? 'pinecone' : 'mock',
    };
  }

  /**
   * 删除品牌所有向量
   */
  @Delete('brand/:brandId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除品牌所有向量' })
  async deleteBrandVectors(@Param('brandId') brandId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.vectorService.deleteBrandVectors(brandId);
  }
}

// 需要添加 Delete 到导入
import { Delete } from '@nestjs/common';
