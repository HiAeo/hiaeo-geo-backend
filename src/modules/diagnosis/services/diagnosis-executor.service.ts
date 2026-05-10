import { Injectable, Logger } from '@nestjs/common';
import { DiagnosisTask, DiagnosisStatus } from '../entities/diagnosis-task.entity';
import { ReportGrade } from '../entities/diagnosis-report.entity';
import { DiagnosisTaskService } from './diagnosis-task.service';
import { HealthScoreCalculatorService } from './health-score-calculator.service';
import { CompetitorAnalyzerService } from './competitor-analyzer.service';
import { IssueIdentifierService } from './issue-identifier.service';
import { ReportGeneratorService } from './report-generator.service';
import { EngineManager } from '../../ai/adapters/engine-manager';
import {
  HealthScoreResult,
  CompetitorAnalysisResult,
  IssueAnalysisResult,
  ReportGenerationResult,
} from '../interfaces/diagnosis.interface';

export interface DiagnosisExecutionResult {
  success: boolean;
  taskId: string;
  reportId?: string;
  error?: string;
  steps: {
    name: string;
    status: 'success' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }[];
}

@Injectable()
export class DiagnosisExecutorService {
  private readonly logger = new Logger(DiagnosisExecutorService.name);

  constructor(
    private taskService: DiagnosisTaskService,
    private engineManager: EngineManager,
    private healthScoreCalculator: HealthScoreCalculatorService,
    private competitorAnalyzer: CompetitorAnalyzerService,
    private issueIdentifier: IssueIdentifierService,
    private reportGenerator: ReportGeneratorService,
  ) {}

  async execute(taskId: string): Promise<DiagnosisExecutionResult> {
    const startTime = Date.now();
    const steps: DiagnosisExecutionResult['steps'] = [];

    const task = await this.taskService.getTaskById(taskId);
    
    if (task.status !== DiagnosisStatus.PENDING && task.status !== DiagnosisStatus.RUNNING) {
      return {
        success: false,
        taskId,
        error: `任务状态为 ${task.status}，无法执行`,
        steps: [],
      };
    }

    try {
      await this.taskService.updateTaskStatus(taskId, DiagnosisStatus.RUNNING, 0);
      this.logger.log(`开始执行诊断任务: ${taskId}`);

      // 步骤1: AI诊断
      const aiDiagnosisStep = await this.executeWithTiming('AI诊断', async () => {
        return await this.executeAIDiagnosis(task);
      });
      steps.push(aiDiagnosisStep);
      
      if (aiDiagnosisStep.status !== 'success' && aiDiagnosisStep.status !== 'skipped') {
        throw new Error('AI诊断步骤失败');
      }
      await this.taskService.updateTaskProgress(taskId, 30);

      // 步骤2: 健康分计算
      const healthScoreStep = await this.executeWithTiming('健康分计算', async () => {
        return await this.executeHealthScoreCalculation(task, aiDiagnosisStep);
      });
      steps.push(healthScoreStep);
      await this.taskService.updateTaskProgress(taskId, 40);

      // 步骤3: 竞品分析 - 可选
      let competitorAnalysis: CompetitorAnalysisResult | null = null;
      const includeCompetitor = task.config?.includeCompetitorAnalysis;
      
      if (includeCompetitor) {
        const competitorStep = await this.executeWithTiming('竞品分析', async () => {
          competitorAnalysis = await this.executeCompetitorAnalysis(task);
          return competitorAnalysis;
        });
        steps.push(competitorStep);
      } else {
        steps.push({
          name: '竞品分析',
          status: 'skipped',
          duration: 0,
        });
      }
      await this.taskService.updateTaskProgress(taskId, 55);

      // 步骤4: 问题识别
      const issueStep = await this.executeWithTiming('问题识别', async () => {
        return await this.executeIssueIdentification(task, aiDiagnosisStep);
      });
      steps.push(issueStep);
      await this.taskService.updateTaskProgress(taskId, 70);

      // 步骤5: 报告生成
      const reportStep = await this.executeWithTiming('报告生成', async () => {
        return await this.executeReportGeneration(
          task,
          healthScoreStep,
          competitorAnalysis,
          issueStep,
        );
      });
      steps.push(reportStep);
      await this.taskService.updateTaskProgress(taskId, 90);

      await this.taskService.updateTaskStatus(taskId, DiagnosisStatus.COMPLETED, 100);

      const totalDuration = Date.now() - startTime;
      this.logger.log(`诊断任务完成: ${taskId}, 耗时: ${totalDuration}ms`);

      return {
        success: true,
        taskId,
        reportId: (reportStep.data as any)?.reportId,
        steps,
      };
    } catch (error) {
      this.logger.error(`诊断任务执行失败: ${taskId}`, error);
      
      await this.taskService.updateTaskStatus(
        taskId,
        DiagnosisStatus.FAILED,
        undefined,
        error.message,
      );

      return {
        success: false,
        taskId,
        error: error.message,
        steps,
      };
    }
  }

  private async executeWithTiming<T>(
    name: string,
    fn: () => Promise<T>,
  ): Promise<{ name: string; status: 'success' | 'failed' | 'skipped'; duration: number; data?: T; error?: string }> {
    const startTime = Date.now();
    try {
      const data = await fn();
      return {
        name,
        status: 'success',
        duration: Date.now() - startTime,
        data,
      };
    } catch (error) {
      return {
        name,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private async executeAIDiagnosis(
    task: DiagnosisTask,
  ): Promise<{ result: any; enginesUsed: string[]; convertedResult?: any }> {
    const engineType = task.aiEngine || 'deepseek';
    const enginesUsed: string[] = [];

    let result;
    let seoDiagnosis = null;

    // 如果有目标网站URL，优先进行SEO诊断
    if (task.website) {
      this.logger.log(`执行SEO诊断 - 目标网站: ${task.website}`);
      
      try {
        const seoParams = {
          targetUrl: task.website,
          targetName: task.brandName,
          targetIndustry: task.industry,
          keywords: task.config?.keywords || [],
        };
        
        // 尝试使用SEO诊断方法
        seoDiagnosis = await this.engineManager.diagnoseSEO(seoParams, engineType);
        this.logger.log(`SEO诊断完成 - 评分: ${seoDiagnosis.seoScore.overall}`);
        enginesUsed.push(engineType);
      } catch (error) {
        this.logger.warn(`SEO诊断失败，使用品牌诊断: ${error.message}`);
        seoDiagnosis = null;
      }
    }

    // 如果SEO诊断成功，使用SEO诊断结果
    if (seoDiagnosis) {
      result = seoDiagnosis;
    } else {
      // 否则使用品牌诊断
      const diagnosisParams = {
        brandName: task.brandName,
        productDescription: task.industry,
        competitors: task.config?.competitors || [],
      };

      if (engineType) {
        result = await this.engineManager.diagnoseBrand(diagnosisParams, engineType);
        enginesUsed.push(engineType);
      } else {
        const batchResult = await this.engineManager.batchDiagnose(diagnosisParams);
        result = batchResult;
        enginesUsed.push(batchResult.engine);
      }
    }

    // 转换 AI 诊断结果为 HealthScoreCalculator 期望的格式
    const convertedResult = this.convertToHealthScoreInput(result, task.brandName, seoDiagnosis !== null);

    return { result, enginesUsed, convertedResult };
  }

  /**
   * 将 AI 诊断结果转换为 HealthScoreCalculator 期望的格式
   * @param isSEODiagnosis 是否为SEO诊断结果
   */
  private convertToHealthScoreInput(result: any, brandName: string, isSEODiagnosis: boolean = false): any {
    // SEO诊断结果处理
    if (isSEODiagnosis && result.seoScore) {
      const issues: Array<{
        id: string;
        category: string;
        title: string;
        description: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        priority: number;
        solution: string;
        estimatedEffort: 'low' | 'medium' | 'high';
        impact: { scoreImpact: number };
        affectedDimensions: string[];
      }> = (result.issues || []).map((issue: any, i: number) => ({
        id: `issue_${i + 1}`,
        category: issue.category || 'general',
        title: issue.title,
        description: issue.description,
        severity: this.mapSeverity(issue.severity),
        priority: this.calculatePriority(issue.severity, i),
        solution: issue.recommendation,
        estimatedEffort: 'medium',
        impact: { scoreImpact: issue.severity === 'high' ? 8 : issue.severity === 'medium' ? 5 : 3 },
        affectedDimensions: this.getAffectedDimensions(issue.category),
      }));

      return {
        diagnosisId: `diag_${Date.now()}`,
        brandName: brandName,
        overallScore: 0,
        dimensionScores: [
          { 
            name: '技术SEO基础', 
            score: result.seoScore.technical || 60, 
            analysis: `技术评分: ${result.seoScore.technical}`, 
            problems: issues.filter(i => i.category === 'technical').map(i => i.title)
          },
          { 
            name: '内容质量与相关性', 
            score: result.seoScore.content || 60, 
            analysis: `内容评分: ${result.seoScore.content}`, 
            problems: issues.filter(i => i.category === 'content').map(i => i.title)
          },
          { 
            name: '外部链接与权威性', 
            score: result.seoScore.authority || 60, 
            analysis: `权威性评分: ${result.seoScore.authority}`, 
            problems: []
          },
          { 
            name: '用户体验', 
            score: result.seoScore.performance || 70, 
            analysis: `性能评分: ${result.seoScore.performance}`, 
            problems: []
          },
          { 
            name: '地理定位优化', 
            score: result.aiSearchPresence?.score || 50, 
            analysis: result.summary || '', 
            problems: []
          },
        ],
        suggestions: result.issues?.map((i: any) => i.recommendation) || [],
        issues: issues,
        summary: {
          total: issues.length,
          critical: issues.filter((i: any) => i.severity === 'critical').length,
          high: issues.filter((i: any) => i.severity === 'high').length,
          medium: issues.filter((i: any) => i.severity === 'medium').length,
          low: issues.filter((i: any) => i.severity === 'low').length,
        },
        aiSearchPresence: result.aiSearchPresence,
      };
    }

    // 品牌诊断结果处理（原有逻辑）
    const advantagesCount = result.competitiveAdvantages?.length || 0;
    const issuesCount = result.potentialIssues?.length || 0;
    const opportunitiesCount = result.marketOpportunities?.length || 0;
    const suggestionsCount = result.contentSuggestions?.length || 0;
    const confidence = result.confidence || 0.8;

    // 基于 AI 分析结果推算各维度分数
    const seoScore = Math.min(100, 50 + advantagesCount * 5 + suggestionsCount * 3);
    const contentScore = Math.min(100, 45 + suggestionsCount * 8);
    const linkScore = Math.min(100, 40 + confidence * 30);
    const uxScore = Math.min(100, 55 + opportunitiesCount * 5);
    const geoScore = Math.min(100, 50 + opportunitiesCount * 6 - issuesCount * 3);

    const issues: Array<{
      id: string;
      category: string;
      title: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      priority: number;
      solution: string;
      estimatedEffort: 'low' | 'medium' | 'high';
      impact: { scoreImpact: number };
      affectedDimensions: string[];
    }> = (result.potentialIssues || []).map((issue: string, i: number) => ({
      id: `issue_${i + 1}`,
      category: 'general',
      title: issue,
      description: issue,
      severity: i < 2 ? 'high' : 'medium',
      priority: i < 3 ? 30 - i * 5 : 15,
      solution: `建议优化: ${issue}`,
      estimatedEffort: 'medium',
      impact: { scoreImpact: 5 },
      affectedDimensions: ['技术SEO基础'],
    }));

    return {
      diagnosisId: result.diagnosisId || `diag_${Date.now()}`,
      brandName: brandName,
      overallScore: 0, // 将由 HealthScoreCalculator 计算
      dimensionScores: [
        { name: '技术SEO基础', score: seoScore, analysis: result.brandPositioning || '', problems: [] },
        { name: '内容质量与相关性', score: contentScore, analysis: `内容建议: ${(result.contentSuggestions || []).slice(0, 2).join('; ')}`, problems: [] },
        { name: '外部链接与权威性', score: linkScore, analysis: `置信度: ${(confidence * 100).toFixed(0)}%`, problems: [] },
        { name: '用户体验', score: uxScore, analysis: `市场机会: ${(result.marketOpportunities || []).slice(0, 2).join('; ')}`, problems: [] },
        { name: '地理定位优化', score: geoScore, analysis: `机会与挑战并存`, problems: [] },
      ],
      suggestions: result.contentSuggestions || [],
      issues: issues,
      summary: {
        total: issues.length,
        critical: issues.filter((i: any) => i.severity === 'critical').length,
        high: issues.filter((i: any) => i.severity === 'high').length,
        medium: issues.filter((i: any) => i.severity === 'medium').length,
        low: issues.filter((i: any) => i.severity === 'low').length,
      },
    };
  }

  private mapSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private calculatePriority(severity: string, index: number): number {
    if (severity === 'high') return 30 - index * 3;
    if (severity === 'medium') return 20 - index * 2;
    return 10;
  }

  private getAffectedDimensions(category: string): string[] {
    switch (category) {
      case 'technical': return ['技术SEO基础'];
      case 'content': return ['内容质量与相关性'];
      case 'authority': return ['外部链接与权威性'];
      case 'performance': return ['用户体验'];
      default: return ['技术SEO基础'];
    }
  }

  private async executeHealthScoreCalculation(
    task: DiagnosisTask,
    aiStep: any,
  ): Promise<HealthScoreResult> {
    if (aiStep.status !== 'success' || !aiStep.data) {
      throw new Error('AI诊断未完成，无法计算健康分');
    }

    // 使用转换后的结果（符合 HealthScoreCalculator 期望的格式）
    return this.healthScoreCalculator.calculate(
      aiStep.data.convertedResult,
      task.config?.dimensions,
    );
  }

  private async executeCompetitorAnalysis(
    task: DiagnosisTask,
  ): Promise<CompetitorAnalysisResult> {
    const competitors = task.config?.competitors || [];
    
    if (competitors.length === 0) {
      return this.competitorAnalyzer.analyzeCompetitors(task.brandName, []);
    }

    return this.competitorAnalyzer.analyzeCompetitors(task.brandName, competitors, task.aiEngine);
  }

  private async executeIssueIdentification(
    task: DiagnosisTask,
    aiStep: any,
  ): Promise<IssueAnalysisResult> {
    if (aiStep.status !== 'success' || !aiStep.data) {
      throw new Error('AI诊断未完成，无法识别问题');
    }

    // 使用转换后的结果
    return this.issueIdentifier.identify(
      aiStep.data.convertedResult,
      aiStep.data.enginesUsed,
    );
  }

  private async executeReportGeneration(
    task: DiagnosisTask,
    healthScoreStep: any,
    competitorAnalysis: CompetitorAnalysisResult | null,
    issueStep: any,
  ): Promise<{ reportId: string } & ReportGenerationResult> {
    try {
      const healthScore = healthScoreStep.data as HealthScoreResult;
      const issues = issueStep.data as IssueAnalysisResult;

      this.logger.log(`开始生成报告 - taskId: ${task.id}, healthScore: ${JSON.stringify(healthScore.overallScore)}`);

      const reportResult = await this.reportGenerator.generate(
        task,
        healthScore,
        competitorAnalysis,
        issues,
      );

      this.logger.log(`报告内容生成完成，准备保存报告`);

      const report = await this.taskService.saveReport({
        taskId: task.id,
        userId: task.userId,
        brandName: task.brandName,
        overallScore: healthScore.overallScore,
        grade: healthScore.grade as unknown as ReportGrade,
        healthLevel: healthScore.healthLevel,
        dimensionScores: healthScore.dimensionScores,
        competitorAnalysis: competitorAnalysis as any,
        issues: issues.issues,
        suggestions: this.generateSuggestionsFromIssues(issues),
        executiveSummary: reportResult.executiveSummary,
        aiInsights: reportResult.aiInsights,
        enginesUsed: [],
      });

      this.logger.log(`报告保存成功 - reportId: ${report.id}`);

      await this.taskService.linkReport(task.id, report.id);

      return {
        ...reportResult,
        reportId: report.id,
      };
    } catch (error) {
      this.logger.error(`报告生成失败 - taskId: ${task.id}, error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private generateSuggestionsFromIssues(issues: IssueAnalysisResult): any[] {
    return issues.issues.map((issue, index) => ({
      id: `suggestion_${index + 1}`,
      category: issue.category,
      title: `修复: ${issue.title}`,
      description: issue.solution,
      expectedImpact: `提升 ${Math.abs(issue.impact.scoreImpact)} 分`,
      effort: issue.estimatedEffort,
      timeline: this.getEffortTimeline(issue.estimatedEffort),
      priority: issue.priority,
    }));
  }

  private getEffortTimeline(effort: 'low' | 'medium' | 'high'): string {
    switch (effort) {
      case 'low':
        return '1-3天';
      case 'medium':
        return '1-2周';
      case 'high':
        return '1个月以上';
    }
  }

  async cancelExecution(taskId: string): Promise<void> {
    await this.taskService.updateTaskStatus(taskId, DiagnosisStatus.CANCELLED);
  }
}
