import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosisTask, DiagnosisStatus, DiagnosisType } from '../entities/diagnosis-task.entity';
import { DiagnosisReport } from '../entities/diagnosis-report.entity';
import { CreateDiagnosisTaskDto } from '../dto/create-diagnosis-task.dto';
import { QueryDiagnosisTaskDto } from '../dto/query-diagnosis.dto';

@Injectable()
export class DiagnosisTaskService {
  constructor(
    @InjectRepository(DiagnosisTask)
    private diagnosisTaskRepository: Repository<DiagnosisTask>,
    @InjectRepository(DiagnosisReport)
    private diagnosisReportRepository: Repository<DiagnosisReport>,
  ) {}

  /**
   * 创建诊断任务
   */
  async createTask(userId: string, dto: CreateDiagnosisTaskDto): Promise<DiagnosisTask> {
    const task = this.diagnosisTaskRepository.create({
      userId,
      brandName: dto.brandName,
      website: dto.website,
      industry: dto.industry,
      targetMarket: dto.targetMarket,
      type: dto.type || DiagnosisType.FULL,
      aiEngine: dto.engine,
      config: {
        dimensions: dto.dimensions,
        includeCompetitorAnalysis: dto.includeCompetitorAnalysis,
        competitors: dto.competitors,
      },
      status: DiagnosisStatus.PENDING,
      progress: 0,
    });

    return this.diagnosisTaskRepository.save(task);
  }

  /**
   * 查询任务列表
   */
  async queryTasks(query: QueryDiagnosisTaskDto): Promise<{
    tasks: DiagnosisTask[];
    total: number;
    page: number;
    pageSize: number;
  }> {
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

  /**
   * 获取任务详情
   */
  async getTaskById(taskId: string, userId?: string): Promise<DiagnosisTask> {
    const where: any = { id: taskId };
    if (userId) {
      where.userId = userId;
    }

    const task = await this.diagnosisTaskRepository.findOne({ where });
    if (!task) {
      throw new NotFoundException(`诊断任务 ${taskId} 不存在`);
    }
    return task;
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(
    taskId: string,
    status: DiagnosisStatus,
    progress?: number,
    errorMessage?: string,
  ): Promise<DiagnosisTask> {
    const task = await this.getTaskById(taskId);

    task.status = status;
    if (progress !== undefined) {
      task.progress = progress;
    }
    if (errorMessage) {
      task.errorMessage = errorMessage;
    }
    if (status === DiagnosisStatus.RUNNING && !task.startedAt) {
      task.startedAt = new Date();
    }
    if (status === DiagnosisStatus.COMPLETED || status === DiagnosisStatus.FAILED) {
      task.completedAt = new Date();
    }

    return this.diagnosisTaskRepository.save(task);
  }

  /**
   * 更新任务进度
   */
  async updateTaskProgress(taskId: string, progress: number, message?: string): Promise<void> {
    await this.diagnosisTaskRepository.update(taskId, {
      progress,
      status: progress < 100 ? DiagnosisStatus.RUNNING : DiagnosisStatus.COMPLETED,
    });
  }

  /**
   * 关联报告
   */
  async linkReport(taskId: string, reportId: string): Promise<void> {
    await this.diagnosisTaskRepository.update(taskId, { reportId });
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string, userId: string): Promise<DiagnosisTask> {
    const task = await this.getTaskById(taskId, userId);

    if (task.status === DiagnosisStatus.COMPLETED) {
      throw new BadRequestException('已完成的任务无法取消');
    }

    task.status = DiagnosisStatus.CANCELLED;
    task.completedAt = new Date();

    return this.diagnosisTaskRepository.save(task);
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.getTaskById(taskId, userId);
    await this.diagnosisTaskRepository.remove(task);
  }

  /**
   * 获取任务对应的报告
   */
  async getReportByTaskId(taskId: string): Promise<DiagnosisReport | null> {
    return this.diagnosisReportRepository.findOne({ where: { taskId } });
  }

  /**
   * 获取报告详情
   */
  async getReportById(reportId: string, userId?: string): Promise<DiagnosisReport> {
    const where: any = { id: reportId };
    if (userId) {
      where.userId = userId;
    }

    const report = await this.diagnosisReportRepository.findOne({ where });
    if (!report) {
      throw new NotFoundException(`诊断报告 ${reportId} 不存在`);
    }
    return report;
  }

  /**
   * 保存诊断报告
   */
  async saveReport(report: Partial<DiagnosisReport>): Promise<DiagnosisReport> {
    const savedReport = this.diagnosisReportRepository.create(report);
    return this.diagnosisReportRepository.save(savedReport);
  }

  /**
   * 获取用户所有报告
   */
  async getReportsByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ reports: DiagnosisReport[]; total: number }> {
    const [reports, total] = await this.diagnosisReportRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { reports, total };
  }
}
