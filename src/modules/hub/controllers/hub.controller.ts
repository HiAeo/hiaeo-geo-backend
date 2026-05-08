import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { HubService } from '../services/hub.service'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('Hub管理驾驶舱')
@Controller('hub')
export class HubController {
  constructor(private readonly hubService: HubService) {}

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
