import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { StrategyService } from '../services/strategy.service';
import { MofaStrategyService } from '../services/mofa-strategy.service';
import { KnowledgeAwareStrategyService } from '../services/knowledge-aware-strategy.service';
import { CreateStrategyDto, UpdateStrategyDto, GenerateStrategyFromReportDto } from '../dto/strategy.dto';
import { StrategyType } from '../dto/mofa-strategy.dto';

@ApiTags('策略管理')
@Controller('strategy')
export class StrategyController {
  constructor(
    private readonly strategyService: StrategyService,
    private readonly mofaStrategyService: MofaStrategyService,
    private readonly knowledgeAwareStrategyService: KnowledgeAwareStrategyService,
  ) {}

  /**
   * 基于知识库生成策略
   * POST /api/v1/strategy/from-knowledge
   */
  @Post('from-knowledge')
  @ApiOperation({ summary: '基于知识库生成策略' })
  @ApiHeader({ name: 'Authorization', description: '用户Token', required: false })
  async generateFromKnowledge(
    @Request() req: any,
    @Body() body: { strategyType?: StrategyType },
  ) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const strategyType = body.strategyType || StrategyType.CONTENT;

    // 获取知识库上下文
    const result = await this.knowledgeAwareStrategyService.generateStrategyFromKnowledge(
      organizationId,
      strategyType,
    );

    if (!result.success || !result.data) {
      return { success: false, message: result.error || '无法获取知识库数据' };
    }

    // 生成策略
    const strategy = await this.mofaStrategyService.generateStrategy(result.data);

    return {
      success: true,
      data: strategy,
      context: {
        brandName: result.data.brandName,
        keywords: result.data.keywords,
      },
      message: '基于知识库的策略生成成功',
    };
  }

  /**
   * 获取知识库上下文
   * GET /api/v1/strategy/knowledge-context
   */
  @Get('knowledge-context')
  @ApiOperation({ summary: '获取知识库上下文用于策略生成' })
  @ApiHeader({ name: 'Authorization', description: '用户Token', required: false })
  async getKnowledgeContext(@Request() req: any) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const context = await this.knowledgeAwareStrategyService.getKnowledgeContextForStrategy(
      organizationId,
    );

    if (!context) {
      return { success: false, message: '未找到知识库' };
    }

    return { success: true, data: context };
  }

  /**
   * 验证策略与知识库一致性
   * POST /api/v1/strategy/validate-consistency
   */
  @Post('validate-consistency')
  @ApiOperation({ summary: '验证策略与知识库的一致性' })
  @ApiHeader({ name: 'Authorization', description: '用户Token', required: false })
  async validateConsistency(
    @Request() req: any,
    @Body() body: { strategy: any },
  ) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const result = await this.knowledgeAwareStrategyService.validateStrategyConsistency(
      organizationId,
      body.strategy,
    );

    return { success: true, ...result };
  }

  @Post('generate-from-report')
  @ApiOperation({ summary: '基于诊断报告生成策略' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: false })
  @ApiResponse({ status: 201, description: '策略生成成功' })
  async generateFromReport(
    @Headers('x-user-id') userId: string,
    @Body() dto: GenerateStrategyFromReportDto,
  ) {
    dto.userId = userId;
    const strategy = await this.strategyService.generateFromDiagnosisReport(dto);
    return {
      success: true,
      data: strategy,
      message: '基于诊断报告的策略生成成功',
    };
  }

  @Post('generate')
  @ApiOperation({ summary: '生成策略' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: false })
  async generate(
    @Headers('x-user-id') userId: string,
    @Body() data: any,
  ) {
    data.userId = userId;
    const strategy = await this.strategyService.generate(data);
    return {
      success: true,
      data: strategy,
      message: '策略生成成功',
    };
  }

  @Get()
  @ApiOperation({ summary: '获取策略列表' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: false })
  @ApiQuery({ name: 'brandId', required: false, description: '品牌ID' })
  @ApiQuery({ name: 'status', required: false, description: '策略状态' })
  async getList(
    @Headers('x-user-id') userId: string,
    @Query('brandId') brandId?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.strategyService.getList({ brandId, status, userId });
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取策略详情' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: false })
  async getById(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    const strategy = await this.strategyService.getById(id);
    if (!strategy) {
      return { success: false, message: '策略不存在' };
    }
    return {
      success: true,
      data: strategy,
    };
  }

  @Post()
  @ApiOperation({ summary: '创建策略' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: false })
  async create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateStrategyDto,
  ) {
    dto.userId = userId;
    const strategy = await this.strategyService.create(dto);
    return {
      success: true,
      data: strategy,
      message: '策略创建成功',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新策略' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStrategyDto,
  ) {
    const strategy = await this.strategyService.update(id, dto);
    if (!strategy) {
      return { success: false, message: '策略不存在' };
    }
    return {
      success: true,
      data: strategy,
      message: '策略更新成功',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除策略' })
  async delete(@Param('id') id: string) {
    const success = await this.strategyService.delete(id);
    return {
      success,
      message: success ? '策略删除成功' : '策略不存在',
    };
  }

  @Post(':id/execute')
  @ApiOperation({ summary: '执行策略' })
  async execute(@Param('id') id: string) {
    const result = await this.strategyService.execute(id);
    return {
      success: result.success,
      data: { executionId: result.executionId },
      message: result.message,
    };
  }
}
