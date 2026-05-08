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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosisController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diagnosis_task_service_1 = require("../services/diagnosis-task.service");
const diagnosis_executor_service_1 = require("../services/diagnosis-executor.service");
const dto_1 = require("../dto");
const diagnosis_task_entity_1 = require("../entities/diagnosis-task.entity");
let DiagnosisController = class DiagnosisController {
    constructor(taskService, executor) {
        this.taskService = taskService;
        this.executor = executor;
    }
    async createTask(userId, dto) {
        const task = await this.taskService.createTask(userId, dto);
        setImmediate(() => {
            this.executor.execute(task.id).catch((error) => {
                console.error(`诊断任务 ${task.id} 自动执行失败:`, error);
            });
        });
        return {
            success: true,
            data: this.mapTaskToResponse(task),
            message: '诊断任务已创建，正在后台执行',
        };
    }
    async queryTasks(userId, query) {
        query.userId = userId;
        const result = await this.taskService.queryTasks(query);
        return {
            success: true,
            data: {
                tasks: result.tasks.map((t) => this.mapTaskToResponse(t)),
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
            },
        };
    }
    async getTask(userId, taskId) {
        const task = await this.taskService.getTaskById(taskId, userId);
        return {
            success: true,
            data: this.mapTaskToResponse(task),
        };
    }
    async getTaskProgress(userId, taskId) {
        const task = await this.taskService.getTaskById(taskId, userId);
        return {
            success: true,
            data: {
                taskId: task.id,
                status: task.status,
                progress: task.progress,
                startedAt: task.startedAt,
                completedAt: task.completedAt,
                errorMessage: task.errorMessage,
            },
        };
    }
    async cancelTask(userId, taskId) {
        const task = await this.taskService.cancelTask(taskId, userId);
        return {
            success: true,
            data: this.mapTaskToResponse(task),
            message: '任务已取消',
        };
    }
    async retryTask(userId, taskId) {
        await this.taskService.getTaskById(taskId, userId);
        await this.taskService.updateTaskStatus(taskId, diagnosis_task_entity_1.DiagnosisStatus.PENDING, 0);
        const result = await this.executor.execute(taskId);
        return {
            success: result.success,
            data: {
                taskId,
                reportId: result.reportId,
                steps: result.steps,
            },
            message: result.success ? '诊断完成' : result.error,
        };
    }
    async deleteTask(userId, taskId) {
        await this.taskService.deleteTask(taskId, userId);
        return {
            success: true,
            message: '任务已删除',
        };
    }
    async getReport(userId, taskId) {
        const task = await this.taskService.getTaskById(taskId, userId);
        const report = await this.taskService.getReportByTaskId(taskId);
        if (!report) {
            return {
                success: false,
                message: task.status === diagnosis_task_entity_1.DiagnosisStatus.COMPLETED
                    ? '报告生成中，请稍后'
                    : '报告尚未生成',
            };
        }
        return {
            success: true,
            data: this.mapReportToResponse(report),
        };
    }
    async getReports(userId, page, pageSize) {
        const result = await this.taskService.getReportsByUserId(userId, page || 1, pageSize || 10);
        return {
            success: true,
            data: {
                reports: result.reports.map((r) => this.mapReportToResponse(r)),
                total: result.total,
            },
        };
    }
    async getReportById(userId, reportId) {
        const report = await this.taskService.getReportById(reportId, userId);
        return {
            success: true,
            data: this.mapReportToResponse(report),
        };
    }
    mapTaskToResponse(task) {
        return {
            id: task.id,
            userId: task.userId,
            brandName: task.brandName,
            website: task.website,
            type: task.type,
            status: task.status,
            progress: task.progress,
            reportId: task.reportId,
            errorMessage: task.errorMessage,
            startedAt: task.startedAt,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
        };
    }
    mapReportToResponse(report) {
        return {
            id: report.id,
            taskId: report.taskId,
            brandName: report.brandName,
            overallScore: report.overallScore,
            grade: report.grade,
            healthLevel: report.healthLevel,
            dimensionScores: report.dimensionScores,
            competitorAnalysis: report.competitorAnalysis,
            issues: report.issues,
            suggestions: report.suggestions,
            executiveSummary: report.executiveSummary,
            aiInsights: report.aiInsights,
            createdAt: report.createdAt,
        };
    }
};
exports.DiagnosisController = DiagnosisController;
__decorate([
    (0, common_1.Post)('tasks'),
    (0, swagger_1.ApiOperation)({ summary: '创建诊断任务' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '任务创建成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateDiagnosisTaskDto]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)('tasks'),
    (0, swagger_1.ApiOperation)({ summary: '查询诊断任务列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回任务列表' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryDiagnosisTaskDto]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "queryTasks", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: '获取诊断任务详情' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回任务详情' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "getTask", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/progress'),
    (0, swagger_1.ApiOperation)({ summary: '获取任务执行进度' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回进度信息' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "getTaskProgress", null);
__decorate([
    (0, common_1.Put)('tasks/:taskId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消诊断任务' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '任务已取消' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "cancelTask", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/retry'),
    (0, swagger_1.ApiOperation)({ summary: '重新执行诊断任务' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '任务重新执行中' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "retryTask", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: '删除诊断任务' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '任务已删除' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "deleteTask", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId/report'),
    (0, swagger_1.ApiOperation)({ summary: '获取诊断报告' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回诊断报告' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)('reports'),
    (0, swagger_1.ApiOperation)({ summary: '获取报告列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回报告列表' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('reports/:reportId'),
    (0, swagger_1.ApiOperation)({ summary: '获取报告详情' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回报告详情' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiagnosisController.prototype, "getReportById", null);
exports.DiagnosisController = DiagnosisController = __decorate([
    (0, swagger_1.ApiTags)('诊断模块'),
    (0, common_1.Controller)('diagnosis'),
    __metadata("design:paramtypes", [diagnosis_task_service_1.DiagnosisTaskService,
        diagnosis_executor_service_1.DiagnosisExecutorService])
], DiagnosisController);
//# sourceMappingURL=diagnosis.controller.js.map