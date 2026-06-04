import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { DiagnosisOptimizationService } from '../services/diagnosis-optimization.service';
import { CompetitorAutoTrackService } from '../services/competitor-auto-track.service';
import { RAGDiagnosisService } from '../services/rag-diagnosis.service';
import { OptimizationPersistenceService } from '../services/optimization-persistence.service';
import { ScheduledCompetitorTrackingService } from '../services/scheduled-competitor-tracking.service';
import { EffectTrackingService } from '../services/effect-tracking.service';

@Controller('v1/optimization')
export class OptimizationController {
  constructor(
    private readonly diagnosisOptimizationService: DiagnosisOptimizationService,
    private readonly competitorAutoTrackService: CompetitorAutoTrackService,
    private readonly ragDiagnosisService: RAGDiagnosisService,
    private readonly optimizationPersistenceService: OptimizationPersistenceService,
    private readonly scheduledCompetitorTrackingService: ScheduledCompetitorTrackingService,
    private readonly effectTrackingService: EffectTrackingService,
  ) {}

  // ==================== 诊断→优化建议 ====================

  @Post('diagnosis/:reportId/generate')
  async generateFromDiagnosis(
    @Param('reportId') reportId: string,
    @Body() body: { brandId: string; diagnosisData?: any },
  ) {
    const result = await this.diagnosisOptimizationService.generateOptimizationFromReport(
      reportId,
      body.brandId,
      body.diagnosisData,
    );
    return { success: true, data: result };
  }

  @Get('brand/:brandId/suggestions')
  async getBrandSuggestions(
    @Param('brandId') brandId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const result = await this.diagnosisOptimizationService.getAllSuggestionsForBrand(brandId);
    return { success: true, data: result };
  }

  // ==================== 竞品自动化 ====================

  @Post('competitor/discover')
  async discoverCompetitors(@Body() body: { brandName: string; keywords?: string[] }) {
    const keywords = body.keywords?.join(',') || '';
    const result = await this.competitorAutoTrackService.autoDiscoverCompetitors(body.brandName, keywords);
    return { success: true, data: result };
  }

  @Post('competitor/:name/track')
  async trackCompetitor(@Param('name') name: string, @Body() body: { brandName: string }) {
    const result = await this.competitorAutoTrackService.trackCompetitor(name, body.brandName);
    return { success: true, data: result };
  }

  @Post('competitor/:name/suppression-strategy')
  async getSuppressionStrategy(@Param('name') name: string, @Body() body: { brandName: string }) {
    const result = await this.competitorAutoTrackService.generateSuppressionStrategy(name, body.brandName);
    return { success: true, data: result };
  }

  @Post('competitor/comparison')
  async getComparisonReport(@Body() body: { brandName: string; competitors?: string[] }) {
    const result = await this.competitorAutoTrackService.getComparisonReport(body.brandName, body.competitors || []);
    return { success: true, data: result };
  }

  @Get('competitor/:brandName/history')
  async getCompetitorHistory(@Param('brandName') brandName: string) {
    const result = await this.competitorAutoTrackService.getTrackingHistory(brandName);
    return { success: true, data: result };
  }

  // ==================== RAG增强诊断 ====================

  @Post('diagnosis/rag-enhanced')
  async ragEnhancedDiagnosis(@Body() body: { brandId: string; brandName: string; website?: string; competitors?: string[] }) {
    const result = await this.ragDiagnosisService.performRAGEnhancedDiagnosis(body.brandId, body);
    return { success: true, data: result };
  }

  @Get('diagnosis/:brandId/rag-context')
  async getRAGContext(@Param('brandId') brandId: string, @Query('focus') focus?: string) {
    const result = await this.ragDiagnosisService.buildRAGContext(brandId, focus);
    return { success: true, data: result };
  }

  // ==================== 优化执行管理 ====================

  @Put('suggestion/:id/status')
  async updateSuggestionStatus(
    @Param('id') id: string,
    @Body() body: { status: string; progress?: number },
  ) {
    await this.optimizationPersistenceService.updateSuggestionStatus(id, body.status, body.progress);
    return { success: true };
  }

  @Post('suggestion/:id/execute')
  async executeSuggestion(
    @Param('id') id: string,
    @Body() body: { brandId: string },
  ) {
    const result = await this.effectTrackingService.getExecutionHistory(body.brandId);
    return { success: true, data: result };
  }

  @Get('brand/:brandId/pending-high-priority')
  async getHighPrioritySuggestions(@Param('brandId') brandId: string) {
    const result = await this.diagnosisOptimizationService.getAllSuggestionsForBrand(brandId);
    const highPriority = result.suggestions.filter((s: any) => 
      s.priority === 'critical' || s.priority === 'high'
    );
    return { success: true, data: highPriority };
  }

  @Get('brand/:brandId/analysis')
  async getBrandAnalysis(@Param('brandId') brandId: string) {
    const result = await this.effectTrackingService.generateEffectAnalysis(brandId);
    return { success: true, data: result };
  }

  // ==================== 效果跟踪 ====================

  @Get('execution/:executionId')
  async getExecutionDetails(@Param('executionId') executionId: string) {
    const result = await this.effectTrackingService.getExecutionDetails(executionId);
    return { success: true, data: result };
  }

  @Get('execution/:executionId/metrics')
  async getEffectMetrics(@Param('executionId') executionId: string) {
    const result = await this.effectTrackingService.getEffectMetrics(executionId);
    return { success: true, data: result };
  }

  @Post('execution/:executionId/track-metric')
  async trackMetric(
    @Param('executionId') executionId: string,
    @Body() body: { traffic?: number; ranking?: number; coverage?: number; authority?: number; suppression?: number; note?: string },
  ) {
    const result = await this.effectTrackingService.trackMetric(executionId, body);
    return { success: true, data: result };
  }

  @Get('brand/:brandId/execution-history')
  async getExecutionHistory(
    @Param('brandId') brandId: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const result = await this.effectTrackingService.getExecutionHistory(brandId, page, size);
    return { success: true, data: result };
  }

  // ==================== 定时竞品追踪 ====================

  @Get('competitor/:brandName/status')
  async getTrackingStatus(@Param('brandName') brandName: string) {
    const result = await this.scheduledCompetitorTrackingService.getTrackingStatus(brandName);
    return { success: true, data: result };
  }

  @Put('competitor/:brandName/schedule')
  async configureSchedule(
    @Param('brandName') brandName: string,
    @Body() body: { schedule: string },
  ) {
    await this.scheduledCompetitorTrackingService.configureSchedule(brandName, body.schedule);
    return { success: true };
  }

  @Post('competitor/:brandName/notify')
  async configureNotification(
    @Param('brandName') brandName: string,
    @Body() body: { channels: string[] },
  ) {
    await this.scheduledCompetitorTrackingService.configureNotification(brandName, body.channels);
    return { success: true };
  }
}
