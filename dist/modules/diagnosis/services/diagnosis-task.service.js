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
exports.DiagnosisTaskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const diagnosis_task_entity_1 = require("../entities/diagnosis-task.entity");
const diagnosis_report_entity_1 = require("../entities/diagnosis-report.entity");
let DiagnosisTaskService = class DiagnosisTaskService {
    constructor(diagnosisTaskRepository, diagnosisReportRepository) {
        this.diagnosisTaskRepository = diagnosisTaskRepository;
        this.diagnosisReportRepository = diagnosisReportRepository;
    }
    async createTask(userId, dto) {
        const task = this.diagnosisTaskRepository.create({
            userId,
            brandName: dto.brandName,
            website: dto.website,
            industry: dto.industry,
            targetMarket: dto.targetMarket,
            type: dto.type || diagnosis_task_entity_1.DiagnosisType.FULL,
            aiEngine: dto.engine,
            config: {
                dimensions: dto.dimensions,
                includeCompetitorAnalysis: dto.includeCompetitorAnalysis,
                competitors: dto.competitors,
            },
            status: diagnosis_task_entity_1.DiagnosisStatus.PENDING,
            progress: 0,
        });
        return this.diagnosisTaskRepository.save(task);
    }
    async queryTasks(query) {
        const queryBuilder = this.diagnosisTaskRepository.createQueryBuilder('task');
        if (query.userId) {
            queryBuilder.andWhere('task.userId = :userId', { userId: query.userId });
        }
        if (query.status) {
            queryBuilder.andWhere('task.status = :status', { status: query.status });
        }
        if (query.type) {
            queryBuilder.andWhere('task.type = :type', { type: query.type });
        }
        if (query.brandName) {
            queryBuilder.andWhere('task.brandName LIKE :brandName', {
                brandName: `%${query.brandName}%`,
            });
        }
        if (query.startDate) {
            queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: query.startDate });
        }
        if (query.endDate) {
            queryBuilder.andWhere('task.createdAt <= :endDate', { endDate: query.endDate });
        }
        queryBuilder.orderBy('task.createdAt', 'DESC');
        const total = await queryBuilder.getCount();
        const page = query.page || 1;
        const pageSize = query.pageSize || 10;
        queryBuilder.skip((page - 1) * pageSize).take(pageSize);
        const tasks = await queryBuilder.getMany();
        return { tasks, total, page, pageSize };
    }
    async getTaskById(taskId, userId) {
        const where = { id: taskId };
        if (userId) {
            where.userId = userId;
        }
        const task = await this.diagnosisTaskRepository.findOne({ where });
        if (!task) {
            throw new common_1.NotFoundException(`诊断任务 ${taskId} 不存在`);
        }
        return task;
    }
    async updateTaskStatus(taskId, status, progress, errorMessage) {
        const task = await this.getTaskById(taskId);
        task.status = status;
        if (progress !== undefined) {
            task.progress = progress;
        }
        if (errorMessage) {
            task.errorMessage = errorMessage;
        }
        if (status === diagnosis_task_entity_1.DiagnosisStatus.RUNNING && !task.startedAt) {
            task.startedAt = new Date();
        }
        if (status === diagnosis_task_entity_1.DiagnosisStatus.COMPLETED || status === diagnosis_task_entity_1.DiagnosisStatus.FAILED) {
            task.completedAt = new Date();
        }
        return this.diagnosisTaskRepository.save(task);
    }
    async updateTaskProgress(taskId, progress, message) {
        await this.diagnosisTaskRepository.update(taskId, {
            progress,
            status: progress < 100 ? diagnosis_task_entity_1.DiagnosisStatus.RUNNING : diagnosis_task_entity_1.DiagnosisStatus.COMPLETED,
        });
    }
    async linkReport(taskId, reportId) {
        await this.diagnosisTaskRepository.update(taskId, { reportId });
    }
    async cancelTask(taskId, userId) {
        const task = await this.getTaskById(taskId, userId);
        if (task.status === diagnosis_task_entity_1.DiagnosisStatus.COMPLETED) {
            throw new common_1.BadRequestException('已完成的任务无法取消');
        }
        task.status = diagnosis_task_entity_1.DiagnosisStatus.CANCELLED;
        task.completedAt = new Date();
        return this.diagnosisTaskRepository.save(task);
    }
    async deleteTask(taskId, userId) {
        const task = await this.getTaskById(taskId, userId);
        await this.diagnosisTaskRepository.remove(task);
    }
    async getReportByTaskId(taskId) {
        return this.diagnosisReportRepository.findOne({ where: { taskId } });
    }
    async getReportById(reportId, userId) {
        const where = { id: reportId };
        if (userId) {
            where.userId = userId;
        }
        const report = await this.diagnosisReportRepository.findOne({ where });
        if (!report) {
            throw new common_1.NotFoundException(`诊断报告 ${reportId} 不存在`);
        }
        return report;
    }
    async saveReport(report) {
        const savedReport = this.diagnosisReportRepository.create(report);
        return this.diagnosisReportRepository.save(savedReport);
    }
    async getReportsByUserId(userId, page = 1, pageSize = 10) {
        const [reports, total] = await this.diagnosisReportRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { reports, total };
    }
};
exports.DiagnosisTaskService = DiagnosisTaskService;
exports.DiagnosisTaskService = DiagnosisTaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(diagnosis_task_entity_1.DiagnosisTask)),
    __param(1, (0, typeorm_1.InjectRepository)(diagnosis_report_entity_1.DiagnosisReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DiagnosisTaskService);
//# sourceMappingURL=diagnosis-task.service.js.map