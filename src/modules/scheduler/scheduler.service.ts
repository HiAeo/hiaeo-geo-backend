import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand, BrandStatus } from '../brand/entities/brand.entity';
import { DiagnosisTask } from '../diagnosis/entities/diagnosis-task.entity';
import { Notification } from '../notification/entities/notification.entity';
import { WorkflowStateService } from '../workflow-state/workflow-state.service';
import { AgentService } from '../agent/services/agent.service';
import { ModuleState } from '../brand/entities/brand.entity';
import {
  TaskType,
  TaskStatus,
  ScheduledTaskConfig,
  TaskExecutionRecord,
  TaskStatistics,
} from './interfaces/scheduler.interface';

/**
 * 调度服务 - 定时任务管理
 */
@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  // 任务执行记录存储（生产环境应使用数据库）
  private executionRecords: Map<string, TaskExecutionRecord[]> = new Map();

  // 任务配置
  private taskConfigs: Map<string, ScheduledTaskConfig> = new Map();

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(DiagnosisTask)
    private diagnosisTaskRepository: Repository<DiagnosisTask>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private workflowStateService: WorkflowStateService,
    private agentService: AgentService,
  ) {
    this.initializeTaskConfigs();
  }

  /**
   * 模块初始化
   */
  async onModuleInit() {
    this.logger.log('调度服务初始化完成');
    this.logTaskStatus();
  }

  /**
   * 初始化任务配置
   */
  private initializeTaskConfigs() {
    const configs: ScheduledTaskConfig[] = [
      {
        id: 'daily_diagnosis',
        name: '每日品牌诊断',
        type: TaskType.DIAGNOSIS,
        cronExpression: '0 2 * * *', // 每天凌晨2点
        enabled: true,
        options: {
          concurrency: 3,
          retryCount: 2,
          timeout: 300000, // 5分钟
        },
      },
      {
        id: 'monitor_collect',
        name: '监控数据采集',
        type: TaskType.MONITOR_COLLECT,
        cronExpression: '0 */6 * * *', // 每6小时
        enabled: true,
        options: {
          concurrency: 5,
          retryCount: 1,
        },
      },
      {
        id: 'health_check',
        name: '系统健康检查',
        type: TaskType.HEALTH_CHECK,
        cronExpression: '*/15 * * * *', // 每15分钟
        enabled: true,
        options: {
          concurrency: 1,
        },
      },
      {
        id: 'notification_cleanup',
        name: '通知清理',
        type: TaskType.NOTIFICATION,
        cronExpression: '0 3 * * *', // 每天凌晨3点
        enabled: true,
        options: {
          concurrency: 1,
        },
      },
    ];

    configs.forEach(config => {
      this.taskConfigs.set(config.id, config);
    });
  }

  /**
   * 获取所有任务配置
   */
  getTaskConfigs(): ScheduledTaskConfig[] {
    return Array.from(this.taskConfigs.values());
  }

  /**
   * 获取单个任务配置
   */
  getTaskConfig(taskId: string): ScheduledTaskConfig | undefined {
    return this.taskConfigs.get(taskId);
  }

  /**
   * 更新任务配置
   */
  updateTaskConfig(taskId: string, updates: Partial<ScheduledTaskConfig>): boolean {
    const config = this.taskConfigs.get(taskId);
    if (!config) return false;

    this.taskConfigs.set(taskId, { ...config, ...updates });
    this.logger.log(`任务配置已更新: ${taskId}`);
    return true;
  }

  /**
   * 获取任务执行记录
   */
  getExecutionRecords(taskId?: string, limit: number = 50): TaskExecutionRecord[] {
    if (taskId) {
      return this.executionRecords.get(taskId)?.slice(-limit) || [];
    }

    // 返回所有任务的最近记录
    const allRecords: TaskExecutionRecord[] = [];
    this.executionRecords.forEach(records => {
      allRecords.push(...records);
    });
    return allRecords.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    ).slice(0, limit);
  }

  /**
   * 获取任务统计
   */
  getTaskStatistics(taskId: string): TaskStatistics | null {
    const records = this.executionRecords.get(taskId) || [];
    if (records.length === 0) return null;

    const successCount = records.filter(r => r.status === TaskStatus.COMPLETED).length;
    const failureCount = records.filter(r => r.status === TaskStatus.FAILED).length;
    const durations = records
      .filter(r => r.duration)
      .map(r => r.duration!);

    return {
      totalExecutions: records.length,
      successCount,
      failureCount,
      avgDuration: durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
      lastExecution: records[records.length - 1],
      nextExecution: this.getNextExecutionTime(taskId),
    };
  }

  /**
   * 计算下次执行时间
   */
  private getNextExecutionTime(taskId: string): string | undefined {
    const config = this.taskConfigs.get(taskId);
    if (!config?.enabled) return undefined;

    // 简化实现，返回估算值
    return new Date(Date.now() + 3600000).toISOString(); // 1小时后
  }

  /**
   * 记录任务执行
   */
  private async recordExecution(record: TaskExecutionRecord) {
    const records = this.executionRecords.get(record.taskId) || [];
    records.push(record);
    
    // 只保留最近100条记录
    if (records.length > 100) {
      records.shift();
    }
    
    this.executionRecords.set(record.taskId, records);
  }

  // ==================== 定时任务实现 ====================

  /**
   * 每日品牌诊断任务
   * 每天凌晨2点执行
   */
  @Cron('0 2 * * *', { name: 'daily_diagnosis' })
  async handleDailyDiagnosis() {
    const taskId = 'daily_diagnosis';
    const startTime = Date.now();

    this.logger.log('开始执行每日品牌诊断任务');

    const record: TaskExecutionRecord = {
      id: `exec_${Date.now()}`,
      taskId,
      taskName: '每日品牌诊断',
      taskType: TaskType.DIAGNOSIS,
      status: TaskStatus.RUNNING,
      startedAt: new Date().toISOString(),
    };

    try {
      // 获取需要诊断的品牌
      const brands = await this.brandRepository.find({
        where: { status: BrandStatus.ACTIVE },
        select: ['id', 'name'],
        take: 50, // 限制数量
      });

      this.logger.log(`找到 ${brands.length} 个品牌待诊断`);

      let successCount = 0;
      let failCount = 0;

      for (const brand of brands) {
        try {
          // 检查是否可以执行诊断
          const canExecute = await this.workflowStateService.canModuleExecute(brand.id, 'diagnosis');
          
          if (canExecute) {
            // 使用 Agent 执行诊断
            const result = await this.agentService.executeChain(brand.id);
            if (result.success) {
              successCount++;
            } else {
              failCount++;
            }
          }
        } catch (error) {
          this.logger.error(`诊断品牌 ${brand.id} 失败`, error);
          failCount++;
        }
      }

      const duration = Date.now() - startTime;

      record.status = TaskStatus.COMPLETED;
      record.completedAt = new Date().toISOString();
      record.duration = duration;
      record.result = {
        success: true,
        output: { successCount, failCount, total: brands.length },
        duration,
        executedAt: record.startedAt,
      };

      this.logger.log(`每日诊断完成: 成功 ${successCount}, 失败 ${failCount}`);
    } catch (error) {
      record.status = TaskStatus.FAILED;
      record.completedAt = new Date().toISOString();
      record.duration = Date.now() - startTime;
      record.error = error.message;
      this.logger.error('每日诊断任务失败', error);
    }

    await this.recordExecution(record);
  }

  /**
   * 监控数据采集任务
   * 每6小时执行
   */
  @Cron('0 */6 * * *', { name: 'monitor_collect' })
  async handleMonitorCollect() {
    const taskId = 'monitor_collect';
    const startTime = Date.now();

    this.logger.log('开始执行监控数据采集任务');

    const record: TaskExecutionRecord = {
      id: `exec_${Date.now()}`,
      taskId,
      taskName: '监控数据采集',
      taskType: TaskType.MONITOR_COLLECT,
      status: TaskStatus.RUNNING,
      startedAt: new Date().toISOString(),
    };

    try {
      // 获取活跃品牌
      const brands = await this.brandRepository.find({
        where: { status: BrandStatus.ACTIVE },
        select: ['id'],
        take: 100,
      });

      // 模拟数据采集
      await this.collectMonitorData(brands.map(b => b.id));

      const duration = Date.now() - startTime;
      record.status = TaskStatus.COMPLETED;
      record.completedAt = new Date().toISOString();
      record.duration = duration;
      record.result = {
        success: true,
        output: { brandsProcessed: brands.length },
        duration,
        executedAt: record.startedAt,
      };

      this.logger.log(`监控数据采集完成: 处理 ${brands.length} 个品牌`);
    } catch (error) {
      record.status = TaskStatus.FAILED;
      record.completedAt = new Date().toISOString();
      record.duration = Date.now() - startTime;
      record.error = error.message;
      this.logger.error('监控数据采集失败', error);
    }

    await this.recordExecution(record);
  }

  /**
   * 采集监控数据（模拟实现）
   */
  private async collectMonitorData(brandIds: string[]): Promise<void> {
    // 实际项目中应该调用监控服务采集真实数据
    this.logger.log(`采集 ${brandIds.length} 个品牌的监控数据`);
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * 系统健康检查任务
   * 每15分钟执行
   */
  @Cron('*/15 * * * *', { name: 'health_check' })
  async handleHealthCheck() {
    const taskId = 'health_check';

    const record: TaskExecutionRecord = {
      id: `exec_${Date.now()}`,
      taskId,
      taskName: '系统健康检查',
      taskType: TaskType.HEALTH_CHECK,
      status: TaskStatus.RUNNING,
      startedAt: new Date().toISOString(),
    };

    try {
      const healthStatus = await this.performHealthCheck();
      
      record.status = TaskStatus.COMPLETED;
      record.completedAt = new Date().toISOString();
      record.duration = 0;
      record.result = {
        success: healthStatus.healthy,
        output: healthStatus,
        duration: 0,
        executedAt: record.startedAt,
      };

      if (!healthStatus.healthy) {
        this.logger.warn('系统健康检查发现问题', healthStatus);
      }
    } catch (error) {
      record.status = TaskStatus.FAILED;
      record.completedAt = new Date().toISOString();
      record.error = error.message;
      this.logger.error('健康检查失败', error);
    }

    await this.recordExecution(record);
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<{
    healthy: boolean;
    services: Record<string, boolean>;
    timestamp: string;
  }> {
    const services: Record<string, boolean> = {};
    
    // 检查数据库连接
    try {
      await this.brandRepository.query('SELECT 1');
      services.database = true;
    } catch {
      services.database = false;
    }

    // 检查 Agent 服务
    try {
      const agentHealth = await this.agentService.getHealthStatus();
      services.agent = agentHealth.healthy;
    } catch {
      services.agent = false;
    }

    const healthy = Object.values(services).every(v => v);

    return {
      healthy,
      services,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 通知清理任务
   * 每天凌晨3点执行
   */
  @Cron('0 3 * * *', { name: 'notification_cleanup' })
  async handleNotificationCleanup() {
    const taskId = 'notification_cleanup';

    const record: TaskExecutionRecord = {
      id: `exec_${Date.now()}`,
      taskId,
      taskName: '通知清理',
      taskType: TaskType.NOTIFICATION,
      status: TaskStatus.RUNNING,
      startedAt: new Date().toISOString(),
    };

    try {
      // 删除30天前的已读通知
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.notificationRepository
        .createQueryBuilder()
        .delete()
        .where('isRead = :isRead', { isRead: true })
        .andWhere('createdAt < :date', { date: thirtyDaysAgo })
        .execute();

      record.status = TaskStatus.COMPLETED;
      record.completedAt = new Date().toISOString();
      record.duration = 0;
      record.result = {
        success: true,
        output: { deletedCount: result.affected || 0 },
        duration: 0,
        executedAt: record.startedAt,
      };

      this.logger.log(`清理了 ${result.affected} 条旧通知`);
    } catch (error) {
      record.status = TaskStatus.FAILED;
      record.completedAt = new Date().toISOString();
      record.error = error.message;
      this.logger.error('通知清理失败', error);
    }

    await this.recordExecution(record);
  }

  /**
   * 手动触发任务
   */
  async triggerTask(taskId: string): Promise<{
    success: boolean;
    executionId?: string;
    error?: string;
  }> {
    const config = this.taskConfigs.get(taskId);
    if (!config) {
      return { success: false, error: '任务不存在' };
    }

    if (!config.enabled) {
      return { success: false, error: '任务已禁用' };
    }

    try {
      switch (taskId) {
        case 'daily_diagnosis':
          await this.handleDailyDiagnosis();
          break;
        case 'monitor_collect':
          await this.handleMonitorCollect();
          break;
        case 'health_check':
          await this.handleHealthCheck();
          break;
        case 'notification_cleanup':
          await this.handleNotificationCleanup();
          break;
        default:
          return { success: false, error: '未知任务类型' };
      }

      return {
        success: true,
        executionId: `exec_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 打印任务状态
   */
  private logTaskStatus() {
    this.logger.log('='.repeat(50));
    this.logger.log('定时任务配置:');
    this.taskConfigs.forEach((config, id) => {
      this.logger.log(`  ${id}: ${config.name} (${config.cronExpression}) - ${config.enabled ? '启用' : '禁用'}`);
    });
    this.logger.log('='.repeat(50));
  }
}
