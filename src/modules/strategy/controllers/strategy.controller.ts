import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StrategyService } from '../services/strategy.service';

@ApiTags('策略管理')
@Controller('strategy')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get()
  @ApiOperation({ summary: '获取策略列表' })
  @ApiQuery({ name: 'brandId', required: false, description: '品牌ID' })
  @ApiQuery({ name: 'status', required: false, description: '策略状态' })
  async getList(@Query('brandId') brandId?: string, @Query('status') status?: string) {
    return this.strategyService.getList({ brandId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取策略详情' })
  async getById(@Param('id') id: string) {
    return this.strategyService.getById(id);
  }

  @Post('generate')
  @ApiOperation({ summary: '生成策略' })
  async generate(@Body() data: any) {
    return this.strategyService.generate(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新策略' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.strategyService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除策略' })
  async delete(@Param('id') id: string) {
    return this.strategyService.delete(id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: '执行策略' })
  async execute(@Param('id') id: string) {
    return this.strategyService.execute(id);
  }
}
