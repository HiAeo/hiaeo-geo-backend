"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DiagnosisExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosisExecutorService = void 0;
const common_1 = require("@nestjs/common");
const diagnosis_task_entity_1 = require("../entities/diagnosis-task.entity");
const diagnosis_task_service_1 = require("./diagnosis-task.service");
const health_score_calculator_service_1 = require("./health-score-calculator.service");
const competitor_analyzer_service_1 = require("./competitor-analyzer.service");
const issue_identifier_service_1 = require("./issue-identifier.service");
const report_generator_service_1 = require("./report-generator.service");
const engine_manager_1 = require("../../ai/adapters/engine-manager");
let DiagnosisExecutorService = DiagnosisExecutorService_1 = class DiagnosisExecutorService {
    constructor(taskService, engineManager, healthScoreCalculator, competitorAnalyzer, issueIdentifier, reportGenerator) {
        this.taskService = taskService;
        this.engineManager = engineManager;
        this.healthScoreCalculator = healthScoreCalculator;
        this.competitorAnalyzer = competitorAnalyzer;
        this.issueIdentifier = issueIdentifier;
        this.reportGenerator = reportGenerator;
        this.logger = new common_1.Logger(DiagnosisExecutorService_1.name);
    }
    async execute(taskId) {
        const startTime = Date.now();
        const steps = [];
        const task = await this.taskService.getTaskById(taskId);
        if (task.status !== diagnosis_task_entity_1.DiagnosisStatus.PENDING && task.status !== diagnosis_task_entity_1.DiagnosisStatus.RUNNING) {
            return {
                success: false,
                taskId,
                error: `任务状态为 ${task.status}，无法执行`,
                steps: [],
            };
        }
        try {
            await this.taskService.updateTaskStatus(taskId, diagnosis_task_entity_1.DiagnosisStatus.RUNNING, 0);
            this.logger.log(`开始执行诊断任务: ${taskId}`);
            const aiDiagnosisStep = await this.executeWithTiming('AI诊断', async () => {
                return await this.executeAIDiagnosis(task);
            });
            steps.push(aiDiagnosisStep);
            if (aiDiagnosisStep.status !== 'success' && aiDiagnosisStep.status !== 'skipped') {
                throw new Error('AI诊断步骤失败');
            }
            await this.taskService.updateTaskProgress(taskId, 30);
            const healthScoreStep = await this.executeWithTiming('健康分计算', async () => {
                return await this.executeHealthScoreCalculation(task, aiDiagnosisStep);
            });
            steps.push(healthScoreStep);
            await this.taskService.updateTaskProgress(taskId, 40);
            let competitorAnalysis = null;
            const includeCompetitor = task.config?.includeCompetitorAnalysis;
            if (includeCompetitor) {
                const competitorStep = await this.executeWithTiming('竞品分析', async () => {
                    competitorAnalysis = await this.executeCompetitorAnalysis(task);
                    return competitorAnalysis;
                });
                steps.push(competitorStep);
            }
            else {
                steps.push({
                    name: '竞品分析',
                    status: 'skipped',
                    duration: 0,
                });
            }
            await this.taskService.updateTaskProgress(taskId, 55);
            const issueStep = await this.executeWithTiming('问题识别', async () => {
                return await this.executeIssueIdentification(task, aiDiagnosisStep);
            });
            steps.push(issueStep);
            await this.taskService.updateTaskProgress(taskId, 70);
            const reportStep = await this.executeWithTiming('报告生成', async () => {
                return await this.executeReportGeneration(task, healthScoreStep, competitorAnalysis, issueStep);
            });
            steps.push(reportStep);
            await this.taskService.updateTaskProgress(taskId, 90);
            await this.taskService.updateTaskStatus(taskId, diagnosis_task_entity_1.DiagnosisStatus.COMPLETED, 100);
            const totalDuration = Date.now() - startTime;
            this.logger.log(`诊断任务完成: ${taskId}, 耗时: ${totalDuration}ms`);
            return {
                success: true,
                taskId,
                reportId: reportStep.data?.reportId,
                steps,
            };
        }
        catch (error) {
            this.logger.error(`诊断任务执行失败: ${taskId}`, error);
            await this.taskService.updateTaskStatus(taskId, diagnosis_task_entity_1.DiagnosisStatus.FAILED, undefined, error.message);
            return {
                success: false,
                taskId,
                error: error.message,
                steps,
            };
        }
    }
    async executeWithTiming(name, fn) {
        const startTime = Date.now();
        try {
            const data = await fn();
            return {
                name,
                status: 'success',
                duration: Date.now() - startTime,
                data,
            };
        }
        catch (error) {
            return {
                name,
                status: 'failed',
                duration: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    async executeAIDiagnosis(task) {
        const engineType = task.aiEngine;
        const enginesUsed = [];
        const diagnosisParams = {
            brandName: task.brandName,
            productDescription: task.industry,
            competitors: task.config?.competitors || [],
        };
        let result;
        if (engineType) {
            result = await this.engineManager.diagnoseBrand(diagnosisParams, engineType);
            enginesUsed.push(engineType);
        }
        else {
            const batchResult = await this.engineManager.batchDiagnose(diagnosisParams);
            result = batchResult;
            enginesUsed.push(batchResult.engine);
        }
        return { result, enginesUsed };
    }
    async executeHealthScoreCalculation(task, aiStep) {
        if (aiStep.status !== 'success' || !aiStep.data) {
            throw new Error('AI诊断未完成，无法计算健康分');
        }
        return this.healthScoreCalculator.calculate(aiStep.data.result, task.config?.dimensions);
    }
    async executeCompetitorAnalysis(task) {
        const competitors = task.config?.competitors || [];
        if (competitors.length === 0) {
            return this.competitorAnalyzer.analyzeCompetitors(task.brandName, []);
        }
        return this.competitorAnalyzer.analyzeCompetitors(task.brandName, competitors, task.aiEngine);
    }
    async executeIssueIdentification(task, aiStep) {
        if (aiStep.status !== 'success' || !aiStep.data) {
            throw new Error('AI诊断未完成，无法识别问题');
        }
        return this.issueIdentifier.identify(aiStep.data.result, aiStep.data.enginesUsed);
    }
    async executeReportGeneration(task, healthScoreStep, competitorAnalysis, issueStep) {
        const healthScore = healthScoreStep.data;
        const issues = issueStep.data;
        const reportResult = await this.reportGenerator.generate(task, healthScore, competitorAnalysis, issues);
        const report = await this.taskService.saveReport({
            taskId: task.id,
            userId: task.userId,
            brandName: task.brandName,
            overallScore: healthScore.overallScore,
            grade: healthScore.grade,
            healthLevel: healthScore.healthLevel,
            dimensionScores: healthScore.dimensionScores,
            competitorAnalysis: competitorAnalysis,
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
    generateSuggestionsFromIssues(issues) {
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
    getEffortTimeline(effort) {
        switch (effort) {
            case 'low':
                return '1-3天';
            case 'medium':
                return '1-2周';
            case 'high':
                return '1个月以上';
        }
    }
    async cancelExecution(taskId) {
        await this.taskService.updateTaskStatus(taskId, diagnosis_task_entity_1.DiagnosisStatus.CANCELLED);
    }
};
exports.DiagnosisExecutorService = DiagnosisExecutorService;
exports.DiagnosisExecutorService = DiagnosisExecutorService = DiagnosisExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [diagnosis_task_service_1.DiagnosisTaskService,
        engine_manager_1.EngineManager,
        health_score_calculator_service_1.HealthScoreCalculatorService,
        competitor_analyzer_service_1.CompetitorAnalyzerService,
        issue_identifier_service_1.IssueIdentifierService,
        report_generator_service_1.ReportGeneratorService])
], DiagnosisExecutorService);
//# sourceMappingURL=diagnosis-executor.service.js.map