import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulerService } from '../scheduler.service';
import {
  ScheduledTaskConfig,
  TaskExecutionRecord,
  TaskStatistics,
} from '../interfaces/scheduler.interface';

@ApiTags('Scheduler - 定时任务')
@ApiBearerAuth()
@Controller('v1/scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  /**
   * 获取所有任务配置
   */
  @Get('tasks')
  @ApiOperation({ summary: '获取所有定时任务配置' })
  async getTaskConfigs(): Promise<ScheduledTaskConfig[]> {
    return this.schedulerService.getTaskConfigs();
  }

  /**
   * 获取单个任务配置
   */
  @Get('tasks/:taskId')
  @ApiOperation({ summary: '获取任务配置' })
  async getTaskConfig(@Param('taskId') taskId: string): Promise<ScheduledTaskConfig | null> {
    return this.schedulerService.getTaskConfig(taskId) || null;
  }

  /**
   * 更新任务配置
   */
  @Post('tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新任务配置' })
  async updateTaskConfig(
    @Param('taskId') taskId: string,
    @Query('enabled') enabled?: string,
  ): Promise<{ success: boolean }> {
    const success = this.schedulerService.updateTaskConfig(taskId, {
      enabled: enabled === 'true',
    });
    return { success };
  }

  /**
   * 获取任务执行记录
   */
  @Get('executions')
  @ApiOperation({ summary: '获取任务执行记录' })
  async getExecutionRecords(
    @Query('taskId') taskId?: string,
    @Query('limit') limit?: string,
  ): Promise<TaskExecutionRecord[]> {
    return this.schedulerService.getExecutionRecords(
      taskId,
      limit ? parseInt(limit, 10) : 50
    );
  }

  /**
   * 获取任务统计
   */
  @Get('statistics/:taskId')
  @ApiOperation({ summary: '获取任务统计' })
  async getTaskStatistics(@Param('taskId') taskId: string): Promise<TaskStatistics | null> {
    return this.schedulerService.getTaskStatistics(taskId);
  }

  /**
   * 手动触发任务
   */
  @Post('tasks/:taskId/trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手动触发任务' })
  async triggerTask(@Param('taskId') taskId: string): Promise<{
    success: boolean;
    executionId?: string;
    error?: string;
  }> {
    return this.schedulerService.triggerTask(taskId);
  }

  /**
   * 获取所有任务统计概览
   */
  @Get('overview')
  @ApiOperation({ summary: '获取所有任务统计概览' })
  async getTasksOverview(): Promise<{
    tasks: Array<{
      id: string;
      name: string;
      enabled: boolean;
      statistics?: TaskStatistics;
    }>;
  }> {
    const configs = this.schedulerService.getTaskConfigs();
    
    return {
      tasks: configs.map(config => ({
        id: config.id,
        name: config.name,
        enabled: config.enabled,
        statistics: this.schedulerService.getTaskStatistics(config.id) || undefined,
      })),
    };
  }
}
