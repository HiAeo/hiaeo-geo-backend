import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosisReport } from '../../diagnosis/entities/diagnosis-report.entity';
import { HealthScoreCalculatorService } from '../../diagnosis/services/health-score-calculator.service';
import { GEOScoreService } from '../../diagnosis/services/geo-score.service';
import {
  OptimizationType,
  OptimizationPriority,
  OptimizationStatus,
  OptimizationSuggestion,
} from '../interfaces/optimization.interface';

/**
 * 诊断结果转优化建议服务
 * 将诊断报告自动转换为可执行的优化任务
 */
@Injectable()
export class DiagnosisOptimizationService {
  private readonly logger = new Logger(DiagnosisOptimizationService.name);

  constructor(
    @InjectRepository(DiagnosisReport)
    private reportRepository: Repository<DiagnosisReport>,
    private healthScoreCalculator: HealthScoreCalculatorService,
    private geoScoreService: GEOScoreService,
  ) {}

  /**
   * 从诊断报告生成优化建议
   * @param reportId 报告ID
   * @param brandId 品牌ID
   * @param diagnosisData 前端传入的诊断数据（本地报告未入库时使用）
   */
  async generateOptimizationFromReport(
    reportId: string,
    brandId: string,
    diagnosisData?: any,
  ): Promise<OptimizationSuggestion[]> {
    this.logger.log(`从诊断报告生成优化建议 - reportId: ${reportId}`);

    let report: DiagnosisReport | any = null;

    // 优先尝试从数据库查询
    if (!reportId.startsWith('local_')) {
      report = await this.reportRepository.findOne({
        where: { id: reportId },
      });
    }

    // 如果数据库没有，使用前端传入的诊断数据
    if (!report && diagnosisData) {
      this.logger.log(`使用前端传入的诊断数据生成建议`);
      report = this.buildReportFromDiagnosisData(diagnosisData, reportId, brandId);
    }

    if (!report) {
      this.logger.warn(`诊断报告不存在且无传入数据: ${reportId}`);
      return [];
    }

    const suggestions: OptimizationSuggestion[] = [];

    // 1. 从问题列表生成优化建议
    if (report.issues) {
      const issueSuggestions = this.generateFromIssues(report.issues, brandId, reportId);
      suggestions.push(...issueSuggestions);
    }

    // 2. 从维度分数生成优化建议（针对低分维度）
    if (report.dimensionScores) {
      const dimensionSuggestions = this.generateFromDimensions(
        report.dimensionScores,
        brandId,
        reportId,
      );
      suggestions.push(...dimensionSuggestions);
    }

    // 3. 从竞品分析生成优化建议
    if (report.competitorAnalysis) {
      const competitorSuggestions = this.generateFromCompetitor(
        report.competitorAnalysis,
        brandId,
        reportId,
      );
      suggestions.push(...competitorSuggestions);
    }

    // 4. 从GEO分数生成特定优化建议
    if (report.geoScores) {
      const geoSuggestions = this.generateFromGEOScores(
        report.geoScores,
        brandId,
        reportId,
      );
      suggestions.push(...geoSuggestions);
    }

    this.logger.log(`生成优化建议 ${suggestions.length} 条`);
    return suggestions;
  }

  /**
   * 将前端诊断数据转换为报告格式
   */
  private buildReportFromDiagnosisData(
    data: any,
    reportId: string,
    brandId: string,
  ): any {
    // 前端传入的数据可能是 result 对象或完整的报告对象
    const result = data.result || data;

    // 构建 issues（从关键发现中推断问题）
    const issues: any[] = [];
    const keyFindings = result.keyFindings || [];
    keyFindings.forEach((finding: string, idx: number) => {
      if (finding.includes('问题') || finding.includes('不足') || finding.includes('落后')) {
        issues.push({
          title: finding,
          category: 'content',
          severity: 'medium',
          description: finding,
          solution: `优化${finding}`,
        });
      }
    });

    // 构建维度分数
    const dimensionScores = (result.dimensions || []).map((dim: any) => ({
      name: dim.name || dim.id,
      score: dim.score || 0,
      analysis: (dim.findings || []).join('；') || dim.description || '',
    }));

    // 构建竞品分析
    const competitorAnalysis = result.competitorAnalysis || null;

    // 构建 GEO 分数
    const geoScores = result.overallScore !== undefined
      ? {
          overall: result.overallScore,
          dimensionDetails: result.dimensions || [],
        }
      : null;

    return {
      id: reportId,
      brandId,
      issues,
      dimensionScores,
      competitorAnalysis,
      geoScores,
    };
  }

  /**
   * 从问题列表生成优化建议
   */
  private generateFromIssues(
    issues: any[],
    brandId: string,
    reportId: string,
  ): OptimizationSuggestion[] {
    return issues.map((issue, index) => {
      const priority = this.mapSeverityToPriority(issue.severity);
      const type = this.inferOptimizationType(issue);
      const autoExecutable = this.canAutoExecute(issue);

      return {
        id: `diag_opt_${reportId}_${index + 1}`,
        brandId,
        type,
        priority,
        title: issue.title || `修复问题: ${issue.category || '未知问题'}`,
        description: issue.description || issue.solution || '',
        rationale: `诊断发现: ${issue.category || '一般问题'} - ${issue.severity || 'medium'}级别`,
        expectedImpact: issue.impact?.scoreImpact
          ? `预计提升 ${issue.impact.scoreImpact} 分`
          : '改善品牌形象',
        estimatedEffort: this.estimateEffort(issue.estimatedEffort, issue.severity),
        status: OptimizationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExecutable,
        relatedMetrics: issue.affectedDimensions || [],
        relatedKeywords: issue.relatedKeywords || [],
        relatedContentId: issue.relatedContentId,
      };
    });
  }

  /**
   * 从维度分数生成优化建议
   */
  private generateFromDimensions(
    dimensionScores: any[],
    brandId: string,
    reportId: string,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const timestamp = Date.now();

    for (const dim of dimensionScores) {
      // 只对低分维度生成建议
      if (dim.score < 60) {
        const priority = dim.score < 40 ? OptimizationPriority.HIGH : OptimizationPriority.MEDIUM;
        const type = this.inferDimensionType(dim.name);

        suggestions.push({
          id: `dim_opt_${reportId}_${dim.name.replace(/\s/g, '_')}`,
          brandId,
          type,
          priority,
          title: `提升 ${dim.name} 评分`,
          description: dim.analysis || `当前评分 ${dim.score}，低于预期水平`,
          rationale: `维度评分 ${dim.score} < 60 分阈值`,
          expectedImpact: `预计提升 ${Math.round((60 - dim.score) * 0.3)}-${Math.round((60 - dim.score) * 0.5)} 分`,
          estimatedEffort: '1-2周',
          status: OptimizationStatus.PENDING,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          autoExecutable: false,
          relatedMetrics: [dim.name],
        });
      }
    }

    return suggestions;
  }

  /**
   * 从竞品分析生成优化建议
   */
  private generateFromCompetitor(
    competitorAnalysis: any,
    brandId: string,
    reportId: string,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 分析竞品差距
    if (competitorAnalysis.competitors) {
      for (const competitor of competitorAnalysis.competitors) {
        if (competitor.gap < -10) {
          suggestions.push({
            id: `comp_opt_${reportId}_${competitor.competitorName}`,
            brandId,
            type: OptimizationType.COMPETITOR,
            priority: OptimizationPriority.HIGH,
            title: `超越竞品: ${competitor.competitorName}`,
            description: `相比竞品存在 ${Math.abs(competitor.gap)} 分差距，需要针对性优化`,
            rationale: `竞品压制指数分析: 差距 ${competitor.gap} 分`,
            expectedImpact: `消除差距，提升竞争优势`,
            estimatedEffort: '2-4周',
            status: OptimizationStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            autoExecutable: false,
            relatedMetrics: ['D4_competitorSuppressionScore'],
          });
        }
      }
    }

    // 市场空白建议
    if (competitorAnalysis.marketGaps?.length > 0) {
      suggestions.push({
        id: `gap_opt_${reportId}_market`,
        brandId,
        type: OptimizationType.CONTENT,
        priority: OptimizationPriority.MEDIUM,
        title: '抢占市场空白',
        description: `发现 ${competitorAnalysis.marketGaps.length} 个未被竞品覆盖的市场机会`,
        rationale: '市场空白分析',
        expectedImpact: '差异化竞争，获取先发优势',
        estimatedEffort: '1-2周',
        status: OptimizationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExecutable: false,
        relatedMetrics: ['D5_contentCoverageScore'],
      });
    }

    return suggestions;
  }

  /**
   * 从GEO分数生成特定优化建议
   */
  private generateFromGEOScores(
    geoScores: any,
    brandId: string,
    reportId: string,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const timestamp = Date.now();

    // GEO 7维度详细分析
    if (geoScores.dimensionDetails) {
      const dimMap: Record<string, { type: OptimizationType; action: string }> = {
        'D1_品牌实体识别准确率': {
          type: OptimizationType.CONTENT,
          action: '加强品牌实体在搜索结果中的识别度',
        },
        'D2_产品关联度': {
          type: OptimizationType.CONTENT,
          action: '优化产品描述和关键词关联',
        },
        'D3_正面情感占比': {
          type: OptimizationType.CONTENT,
          action: '增加正面内容输出，减少负面提及',
        },
        'D4_竞品压制指数': {
          type: OptimizationType.COMPETITOR,
          action: '加强竞品关键词压制策略',
        },
        'D5_内容覆盖度': {
          type: OptimizationType.CONTENT,
          action: '扩展内容覆盖范围，增加长尾词布局',
        },
        'D6_官网引流率': {
          type: OptimizationType.LOCAL,
          action: '优化官网导流路径，增加引流入口',
        },
        'D7_更新活跃度': {
          type: OptimizationType.CONTENT,
          action: '保持内容定期更新，提高活跃度',
        },
      };

      for (const dim of geoScores.dimensionDetails) {
        if (dim.score < 50) {
          const config = dimMap[dim.name] || { type: OptimizationType.CONTENT, action: dim.analysis };

          suggestions.push({
            id: `geo_opt_${reportId}_${dim.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
            brandId,
            type: config.type,
            priority: OptimizationPriority.HIGH,
            title: `GEO优化: ${dim.name}`,
            description: `${config.action}。${dim.analysis}`,
            rationale: `GEO评分 ${dim.score} 分 (权重 ${dim.weight * 100}%)`,
            expectedImpact: `最高可提升综合评分 ${Math.round(dim.score * dim.weight * 0.5)} 分`,
            estimatedEffort: '1-2周',
            status: OptimizationStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            autoExecutable: false,
            relatedMetrics: [dim.name],
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * 映射问题严重性到优化优先级
   */
  private mapSeverityToPriority(severity: string): OptimizationPriority {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return OptimizationPriority.CRITICAL;
      case 'high':
        return OptimizationPriority.HIGH;
      case 'medium':
        return OptimizationPriority.MEDIUM;
      case 'low':
      default:
        return OptimizationPriority.LOW;
    }
  }

  /**
   * 推断优化类型
   */
  private inferOptimizationType(issue: any): OptimizationType {
    const category = (issue.category || '').toLowerCase();
    const title = (issue.title || '').toLowerCase();

    if (category.includes('keyword') || title.includes('关键词')) {
      return OptimizationType.KEYWORD;
    }
    if (category.includes('content') || title.includes('内容')) {
      return OptimizationType.CONTENT;
    }
    if (category.includes('technical') || title.includes('技术')) {
      return OptimizationType.TECHNICAL;
    }
    if (category.includes('competitor') || title.includes('竞品')) {
      return OptimizationType.COMPETITOR;
    }
    if (category.includes('local') || title.includes('本地')) {
      return OptimizationType.LOCAL;
    }
    if (category.includes('link') || title.includes('链接')) {
      return OptimizationType.LINK;
    }

    return OptimizationType.CONTENT;
  }

  /**
   * 推断维度类型
   */
  private inferDimensionType(dimName: string): OptimizationType {
    const name = dimName.toLowerCase();

    if (name.includes('技术') || name.includes('technical')) {
      return OptimizationType.TECHNICAL;
    }
    if (name.includes('内容') || name.includes('coverage')) {
      return OptimizationType.CONTENT;
    }
    if (name.includes('竞品') || name.includes('competitor') || name.includes('suppression')) {
      return OptimizationType.COMPETITOR;
    }
    if (name.includes('本地') || name.includes('local')) {
      return OptimizationType.LOCAL;
    }
    if (name.includes('链接') || name.includes('link') || name.includes('authority')) {
      return OptimizationType.LINK;
    }
    if (name.includes('品牌') || name.includes('keyword')) {
      return OptimizationType.KEYWORD;
    }

    return OptimizationType.CONTENT;
  }

  /**
   * 判断是否可以自动执行
   */
  private canAutoExecute(issue: any): boolean {
    // 低优先级问题可以自动处理
    if (issue.severity === 'low' || issue.priority < 20) {
      return true;
    }

    // 已明确可自动执行的问题类型
    const autoTypes = ['content_suggestion', 'keyword_optimization'];
    if (autoTypes.includes(issue.category)) {
      return true;
    }

    return false;
  }

  /**
   * 估算工作量
   */
  private estimateEffort(effort: string, severity: string): string {
    if (effort) return effort;

    switch (severity?.toLowerCase()) {
      case 'critical':
        return '1周以内';
      case 'high':
        return '1-2周';
      case 'medium':
        return '2-4周';
      case 'low':
      default:
        return '1-3天';
    }
  }

  /**
   * 获取品牌的所有优化建议（从所有诊断报告中汇总）
   */
  async getAllSuggestionsForBrand(
    brandId: string,
    limit: number = 20,
  ): Promise<{
    suggestions: OptimizationSuggestion[];
    summary: {
      total: number;
      byPriority: Record<string, number>;
      byType: Record<string, number>;
    };
  }> {
    const reports = await this.reportRepository.find({
      where: { userId: brandId } as any,
      order: { createdAt: 'DESC' },
      take: 5, // 最近5次诊断
    });

    const allSuggestions: OptimizationSuggestion[] = [];

    for (const report of reports) {
      const suggestions = await this.generateOptimizationFromReport(report.id, brandId);
      allSuggestions.push(...suggestions);
    }

    // 去重（基于标题）
    const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);

    // 排序（按优先级）
    uniqueSuggestions.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        [OptimizationPriority.CRITICAL]: 0,
        [OptimizationPriority.HIGH]: 1,
        [OptimizationPriority.MEDIUM]: 2,
        [OptimizationPriority.LOW]: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // 统计
    const summary = {
      total: uniqueSuggestions.length,
      byPriority: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    for (const s of uniqueSuggestions) {
      summary.byPriority[s.priority] = (summary.byPriority[s.priority] || 0) + 1;
      summary.byType[s.type] = (summary.byType[s.type] || 0) + 1;
    }

    return {
      suggestions: uniqueSuggestions.slice(0, limit),
      summary,
    };
  }

  /**
   * 去重优化建议
   */
  private deduplicateSuggestions(suggestions: OptimizationSuggestion[]): OptimizationSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter((s) => {
      const key = `${s.type}_${s.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
