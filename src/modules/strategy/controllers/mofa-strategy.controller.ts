import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { MofaStrategyService } from '../services/mofa-strategy.service';
import { GenerateMofaStrategyDto, QueryMofaStrategyDto, StrategyType } from '../dto/mofa-strategy.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('模豆策略生成')
@ApiBearerAuth()
@Controller('strategy/mofa')
@UseGuards(JwtAuthGuard)
export class MofaStrategyController {
  constructor(private readonly mofaStrategyService: MofaStrategyService) {}

  @Post('generate')
  @ApiOperation({ summary: '生成模豆策略' })
  @ApiResponse({ status: 201, description: '策略生成成功' })
  async generateStrategy(@Body() dto: GenerateMofaStrategyDto) {
    return this.mofaStrategyService.generateStrategy(dto);
  }

  @Get()
  @ApiOperation({ summary: '获取策略列表' })
  @ApiQuery({ name: 'brandId', required: false, description: '品牌ID' })
  @ApiQuery({ name: 'strategyType', required: false, enum: StrategyType, description: '策略类型' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getStrategyList(@Query() query: QueryMofaStrategyDto) {
    return this.mofaStrategyService.getStrategyList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取策略详情' })
  async getStrategyById(@Param('id') id: string) {
    return this.mofaStrategyService.getStrategyById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新策略' })
  async updateStrategy(@Param('id') id: string, @Body() updates: any) {
    return this.mofaStrategyService.updateStrategy(id, updates);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除策略' })
  async deleteStrategy(@Param('id') id: string) {
    const success = await this.mofaStrategyService.deleteStrategy(id);
    return { success, message: success ? '删除成功' : '删除失败' };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: '激活策略' })
  async activateStrategy(@Param('id') id: string) {
    return this.mofaStrategyService.activateStrategy(id);
  }

  @Post('generate/competitor')
  @ApiOperation({ summary: '生成竞品策略' })
  async generateCompetitorStrategy(@Body() dto: GenerateMofaStrategyDto) {
    return this.mofaStrategyService.generateCompetitorStrategy(dto);
  }

  @Post('generate/product')
  @ApiOperation({ summary: '生成产品策略' })
  async generateProductStrategy(@Body() dto: GenerateMofaStrategyDto) {
    return this.mofaStrategyService.generateProductStrategy(dto);
  }

  @Post('generate/faq')
  @ApiOperation({ summary: '生成FAQ策略' })
  async generateFaqStrategy(@Body() dto: GenerateMofaStrategyDto) {
    return this.mofaStrategyService.generateFaqStrategy(dto);
  }
}
