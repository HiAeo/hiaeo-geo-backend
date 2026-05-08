import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { DiagnosisTaskService } from '../services/diagnosis-task.service';
import { DiagnosisExecutorService } from '../services/diagnosis-executor.service';
import {
  CreateDiagnosisTaskDto,
  QueryDiagnosisTaskDto,
  DiagnosisTaskResponseDto,
  DiagnosisReportResponseDto,
} from '../dto';
import { DiagnosisStatus } from '../entities/diagnosis-task.entity';

@ApiTags('诊断模块')
@Controller('diagnosis')
export class DiagnosisController {
  constructor(
    private readonly taskService: DiagnosisTaskService,
    private readonly executor: DiagnosisExecutorService,
  ) {}

  /**
   * 创建诊断任务
   */
  @Post('tasks')
  @ApiOperation({ summary: '创建诊断任务' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 201, description: '任务创建成功' })
  async createTask(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateDiagnosisTaskDto,
  ) {
    const task = await this.taskService.createTask(userId, dto);

    // 自动执行诊断
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

  /**
   * 查询诊断任务列表
   */
  @Get('tasks')
  @ApiOperation({ summary: '查询诊断任务列表' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回任务列表' })
  async queryTasks(
    @Headers('x-user-id') userId: string,
    @Query() query: QueryDiagnosisTaskDto,
  ) {
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

  /**
   * 获取任务详情
   */
  @Get('tasks/:taskId')
  @ApiOperation({ summary: '获取诊断任务详情' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回任务详情' })
  async getTask(
    @Headers('x-user-id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    const task = await this.taskService.getTaskById(taskId, userId);
    return {
      success: true,
      data: this.mapTaskToResponse(task),
    };
  }

  /**
   * 获取任务进度
   */
  @Get('tasks/:taskId/progress')
  @ApiOperation({ summary: '获取任务执行进度' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回进度信息' })
  async getTaskProgress(
    @Headers('x-user-id') userId: string,
    @Param('taskId') taskId: string,
  ) {
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

  /**
   * 取消任务
   */
  @Put('tasks/:taskId/cancel')
  @ApiOperation({ summary: '取消诊断任务' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '任务已取消' })
  async cancelTask(
    @Headers('x-user-id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    const task = await this.taskService.cancelTask(taskId, userId);
    return {
      success: true,
      data: this.mapTaskToResponse(task),
      message: '任务已取消',
    };
  }

  /**
   * 重新执行任务
   */
  @Post('tasks/:taskId/retry')
  @ApiOperation({ summary: '重新执行诊断任务' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '任务重新执行中' })
  async retryTask(
    @Headers('x-user-id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    // 验证任务存在
    await this.taskService.getTaskById(taskId, userId);

    // 重置状态
    await this.taskService.updateTaskStatus(
      taskId,
      DiagnosisStatus.PENDING,
      0,
    );

    // 执行诊断
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

  /**
   * 删除任务
   */
  @Delete('tasks/:taskId')
  @ApiOperation({ summary: '删除诊断任务' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '任务已删除' })
  async deleteTask(
    @Headers('x-user-id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    await this.taskService.deleteTask(taskId, userId);
    return {
      success: true,
      message: '任务已删除',
    };
  }

  /**
   * 获取诊断报告
   */
  @Get('tasks/:taskId/report')
  @ApiOperation({ summary: '获取诊断报告' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回诊断报告' })
  async getReport(
    @Headers('x-user-id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    // 验证任务
    const task = await this.taskService.getTaskById(taskId, userId);

    // 获取报告
    const report = await this.taskService.getReportByTaskId(taskId);

    if (!report) {
      return {
        success: false,
        message: task.status === DiagnosisStatus.COMPLETED
          ? '报告生成中，请稍后'
          : '报告尚未生成',
      };
    }

    return {
      success: true,
      data: this.mapReportToResponse(report),
    };
  }

  /**
   * 获取报告列表
   */
  @Get('reports')
  @ApiOperation({ summary: '获取报告列表' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiResponse({ status: 200, description: '返回报告列表' })
  async getReports(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.taskService.getReportsByUserId(
      userId,
      page || 1,
      pageSize || 10,
    );

    return {
      success: true,
      data: {
        reports: result.reports.map((r) => this.mapReportToResponse(r)),
        total: result.total,
      },
    };
  }

  /**
   * 获取报告详情
   */
  @Get('reports/:reportId')
  @ApiOperation({ summary: '获取报告详情' })
  @ApiHeader({ name: 'x-user-id', description: '用户ID', required: true })
  @ApiResponse({ status: 200, description: '返回报告详情' })
  async getReportById(
    @Headers('x-user-id') userId: string,
    @Param('reportId') reportId: string,
  ) {
    const report = await this.taskService.getReportById(reportId, userId);
    return {
      success: true,
      data: this.mapReportToResponse(report),
    };
  }

  /**
   * 映射任务到响应
   */
  private mapTaskToResponse(task: any): DiagnosisTaskResponseDto {
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

  /**
   * 映射报告到响应
   */
  private mapReportToResponse(report: any): DiagnosisReportResponseDto {
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
}
