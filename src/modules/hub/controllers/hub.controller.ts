import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { HubService } from '../services/hub.service'
import { KnowledgeDataSourceService } from '../services/knowledge-data-source.service'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('Hub管理驾驶舱')
@Controller('hub')
export class HubController {
  constructor(
    private readonly hubService: HubService,
    private readonly knowledgeDataSourceService: KnowledgeDataSourceService,
  ) {}

  /**
   * 获取知识库健康度指标
   * GET /api/hub/knowledge-health
   */
  @Get('knowledge-health')
  @ApiOperation({ summary: '获取知识库健康度指标' })
  @ApiResponse({ status: 200, description: '知识库健康度数据' })
  async getKnowledgeHealth(@Request() req: any) {
    const organizationId = req.user?.organizationId

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' }
    }

    const health = await this.knowledgeDataSourceService.getKnowledgeHealthMetrics(organizationId)
    return {
      success: true,
      data: health,
    }
  }

  /**
   * 获取知识库统计概览
   * GET /api/hub/knowledge-stats
   */
  @Get('knowledge-stats')
  @ApiOperation({ summary: '获取知识库统计概览' })
  async getKnowledgeStats() {
    const stats = await this.knowledgeDataSourceService.getKnowledgeStats('')
    return {
      success: true,
      data: stats,
    }
  }

  /**
   * 获取知识库完整度趋势
   * GET /api/hub/knowledge-trend
   */
  @Get('knowledge-trend')
  @ApiOperation({ summary: '获取知识库完整度趋势' })
  async getKnowledgeTrend(
    @Request() req: any,
    @Query('days') days?: string,
  ) {
    const organizationId = req.user?.organizationId

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' }
    }

    const trend = await this.knowledgeDataSourceService.getCompletenessTrend(
      organizationId,
      days ? parseInt(days, 10) : 30,
    )
    return {
      success: true,
      data: trend,
    }
  }

  /**
   * 获取诊断与知识库关联数据
   * GET /api/hub/knowledge-diagnosis-correlation
   */
  @Get('knowledge-diagnosis-correlation')
  @ApiOperation({ summary: '获取诊断与知识库关联数据' })
  async getKnowledgeDiagnosisCorrelation(@Request() req: any) {
    const organizationId = req.user?.organizationId

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' }
    }

    const correlation = await this.knowledgeDataSourceService.getKnowledgeDiagnosisCorrelation(
      organizationId,
    )
    return {
      success: true,
      data: correlation,
    }
  }

  @Get('stats')
  @ApiOperation({ summary: '获取Hub统计数据' })
  @ApiResponse({ status: 200, description: '统计数据' })
  async getStats(@Query('brandId') brandId?: string) {
    return this.hubService.getStats(brandId)
  }

  @Get('boss-view')
  @ApiOperation({ summary: '老板视图数据' })
  async getBossView(@Query('brandId') brandId?: string) {
    return this.hubService.getBossView(brandId)
  }

  @Get('ops-view')
  @ApiOperation({ summary: '运营视图数据' })
  async getOpsView(@Query('brandId') brandId?: string) {
    return this.hubService.getOpsView(brandId)
  }

  @Get('tech-view')
  @ApiOperation({ summary: '技术视图数据' })
  async getTechView(@Query('brandId') brandId?: string) {
    return this.hubService.getTechView(brandId)
  }

  @Get('brand-ranking')
  @ApiOperation({ summary: '品牌排名数据' })
  async getBrandRanking() {
    return this.hubService.getBrandRanking()
  }

  @Get('visibility-trend')
  @ApiOperation({ summary: '可见度趋势数据' })
  async getVisibilityTrend(@Query('period') period: string = '30d') {
    return this.hubService.getVisibilityTrend(period)
  }

  @Get('pending-tasks')
  @ApiOperation({ summary: '待处理任务列表' })
  async getPendingTasks(@Query('brandId') brandId?: string) {
    return this.hubService.getPendingTasks(brandId)
  }

  @Get('suggestions')
  @ApiOperation({ summary: '运营建议列表' })
  async getSuggestions(@Query('brandId') brandId?: string) {
    return this.hubService.getSuggestions(brandId)
  }
}
