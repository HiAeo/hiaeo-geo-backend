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
  ): Promise<{ result: any; enginesUsed: string[] }> {
    const engineType = task.aiEngine;
    const enginesUsed: string[] = [];

    const diagnosisParams = {
      brandName: task.brandName,
      productDescription: task.industry,
      competitors: task.config?.competitors || [],
    };

    let result;
    if (engineType) {
      result = await this.engineManager.diagnoseBrand(diagnosisParams, engineType);
      enginesUsed.push(engineType);
    } else {
      const batchResult = await this.engineManager.batchDiagnose(diagnosisParams);
      result = batchResult;
      enginesUsed.push(batchResult.engine);
    }

    return { result, enginesUsed };
  }

  private async executeHealthScoreCalculation(
    task: DiagnosisTask,
    aiStep: any,
  ): Promise<HealthScoreResult> {
    if (aiStep.status !== 'success' || !aiStep.data) {
      throw new Error('AI诊断未完成，无法计算健康分');
    }

    return this.healthScoreCalculator.calculate(
      aiStep.data.result,
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

    return this.issueIdentifier.identify(
      aiStep.data.result,
      aiStep.data.enginesUsed,
    );
  }

  private async executeReportGeneration(
    task: DiagnosisTask,
    healthScoreStep: any,
    competitorAnalysis: CompetitorAnalysisResult | null,
    issueStep: any,
  ): Promise<{ reportId: string } & ReportGenerationResult> {
    const healthScore = healthScoreStep.data as HealthScoreResult;
    const issues = issueStep.data as IssueAnalysisResult;

    const reportResult = await this.reportGenerator.generate(
      task,
      healthScore,
      competitorAnalysis,
      issues,
    );

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

    await this.taskService.linkReport(task.id, report.id);

    return {
      ...reportResult,
      reportId: report.id,
    };
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
