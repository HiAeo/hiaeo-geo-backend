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
        const engineType = task.aiEngine || 'deepseek';
        const enginesUsed = [];
        let result;
        let seoDiagnosis = null;
        if (task.website) {
            this.logger.log(`执行SEO诊断 - 目标网站: ${task.website}`);
            try {
                const seoParams = {
                    targetUrl: task.website,
                    targetName: task.brandName,
                    targetIndustry: task.industry,
                    keywords: task.config?.keywords || [],
                };
                seoDiagnosis = await this.engineManager.diagnoseSEO(seoParams, engineType);
                this.logger.log(`SEO诊断完成 - 评分: ${seoDiagnosis.seoScore.overall}`);
                enginesUsed.push(engineType);
            }
            catch (error) {
                this.logger.warn(`SEO诊断失败，使用品牌诊断: ${error.message}`);
                seoDiagnosis = null;
            }
        }
        if (seoDiagnosis) {
            result = seoDiagnosis;
        }
        else {
            const diagnosisParams = {
                brandName: task.brandName,
                productDescription: task.industry,
                competitors: task.config?.competitors || [],
            };
            if (engineType) {
                result = await this.engineManager.diagnoseBrand(diagnosisParams, engineType);
                enginesUsed.push(engineType);
            }
            else {
                const batchResult = await this.engineManager.batchDiagnose(diagnosisParams);
                result = batchResult;
                enginesUsed.push(batchResult.engine);
            }
        }
        const convertedResult = this.convertToHealthScoreInput(result, task.brandName, seoDiagnosis !== null);
        return { result, enginesUsed, convertedResult };
    }
    convertToHealthScoreInput(result, brandName, isSEODiagnosis = false) {
        if (isSEODiagnosis && result.seoScore) {
            const issues = (result.issues || []).map((issue, i) => ({
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
                suggestions: result.issues?.map((i) => i.recommendation) || [],
                issues: issues,
                summary: {
                    total: issues.length,
                    critical: issues.filter((i) => i.severity === 'critical').length,
                    high: issues.filter((i) => i.severity === 'high').length,
                    medium: issues.filter((i) => i.severity === 'medium').length,
                    low: issues.filter((i) => i.severity === 'low').length,
                },
                aiSearchPresence: result.aiSearchPresence,
            };
        }
        const advantagesCount = result.competitiveAdvantages?.length || 0;
        const issuesCount = result.potentialIssues?.length || 0;
        const opportunitiesCount = result.marketOpportunities?.length || 0;
        const suggestionsCount = result.contentSuggestions?.length || 0;
        const confidence = result.confidence || 0.8;
        const seoScore = Math.min(100, 50 + advantagesCount * 5 + suggestionsCount * 3);
        const contentScore = Math.min(100, 45 + suggestionsCount * 8);
        const linkScore = Math.min(100, 40 + confidence * 30);
        const uxScore = Math.min(100, 55 + opportunitiesCount * 5);
        const geoScore = Math.min(100, 50 + opportunitiesCount * 6 - issuesCount * 3);
        const issues = (result.potentialIssues || []).map((issue, i) => ({
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
            overallScore: 0,
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
                critical: issues.filter((i) => i.severity === 'critical').length,
                high: issues.filter((i) => i.severity === 'high').length,
                medium: issues.filter((i) => i.severity === 'medium').length,
                low: issues.filter((i) => i.severity === 'low').length,
            },
        };
    }
    mapSeverity(severity) {
        switch (severity) {
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'medium';
        }
    }
    calculatePriority(severity, index) {
        if (severity === 'high')
            return 30 - index * 3;
        if (severity === 'medium')
            return 20 - index * 2;
        return 10;
    }
    getAffectedDimensions(category) {
        switch (category) {
            case 'technical': return ['技术SEO基础'];
            case 'content': return ['内容质量与相关性'];
            case 'authority': return ['外部链接与权威性'];
            case 'performance': return ['用户体验'];
            default: return ['技术SEO基础'];
        }
    }
    async executeHealthScoreCalculation(task, aiStep) {
        if (aiStep.status !== 'success' || !aiStep.data) {
            throw new Error('AI诊断未完成，无法计算健康分');
        }
        return this.healthScoreCalculator.calculate(aiStep.data.convertedResult, task.config?.dimensions);
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
        return this.issueIdentifier.identify(aiStep.data.convertedResult, aiStep.data.enginesUsed);
    }
    async executeReportGeneration(task, healthScoreStep, competitorAnalysis, issueStep) {
        try {
            const healthScore = healthScoreStep.data;
            const issues = issueStep.data;
            this.logger.log(`开始生成报告 - taskId: ${task.id}, healthScore: ${JSON.stringify(healthScore.overallScore)}`);
            const reportResult = await this.reportGenerator.generate(task, healthScore, competitorAnalysis, issues);
            this.logger.log(`报告内容生成完成，准备保存报告`);
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
            this.logger.log(`报告保存成功 - reportId: ${report.id}`);
            await this.taskService.linkReport(task.id, report.id);
            return {
                ...reportResult,
                reportId: report.id,
            };
        }
        catch (error) {
            this.logger.error(`报告生成失败 - taskId: ${task.id}, error: ${error.message}`, error.stack);
            throw error;
        }
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