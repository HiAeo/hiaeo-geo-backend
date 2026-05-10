"use strict";
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  WorkflowDefinition,
  WorkflowTriggerType,
  WorkflowCondition,
  WorkflowAction,
} from '../entities/workflow-definition.entity';
import {
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowActionResult,
} from '../entities/workflow-execution.entity';
import { ActionExecutorService } from './action-executor.service';

export interface ExecutionContext {
  organizationId: string;
  knowledgeId?: string;
  score?: number;
  reportId?: string;
  indexType?: string;
  cronExpression?: string;
  triggeredBy?: string;
  [key: string]: any;
}

export interface ExecutionResult {
  success: boolean;
  executionId: string;
  actionResults: WorkflowActionResult[];
  error?: string;
  duration: number;
}

/**
 * 工作流引擎 - 核心执行逻辑
 */
@Injectable()
export class WorkflowEngine {
  private readonly logger = new Logger(WorkflowEngine.name);

  constructor(
    @InjectRepository(WorkflowDefinition)
    private readonly workflowRepo: Repository<WorkflowDefinition>,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepo: Repository<WorkflowExecution>,
    private readonly actionExecutor: ActionExecutorService,
  ) {}

  /**
   * 评估条件是否满足
   */
  evaluateConditions(workflow: WorkflowDefinition, context: ExecutionContext): boolean {
    const conditions = workflow.conditions || [];
    
    if (conditions.length === 0) {
      return true; // 没有条件，默认满足
    }

    return conditions.every((condition) => {
      const value = this.getContextValue(context, condition.field);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  /**
   * 获取上下文值
   */
  private getContextValue(context: ExecutionContext, field: string): any {
    return context[field];
  }

  /**
   * 评估单个条件
   */
  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'eq':
        return value === expected;
      case 'ne':
        return value !== expected;
      case 'gt':
        return value > expected;
      case 'gte':
        return value >= expected;
      case 'lt':
        return value < expected;
      case 'lte':
        return value <= expected;
      case 'contains':
        return String(value).includes(String(expected));
      case 'in':
        return Array.isArray(expected) && expected.includes(value);
      case 'notIn':
        return Array.isArray(expected) && !expected.includes(value);
      default:
        this.logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * 执行工作流
   */
  async execute(workflowId: string, context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    // 加载工作流定义
    const workflow = await this.workflowRepo.findOne({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (!workflow.isEnabled) {
      throw new Error(`Workflow is disabled: ${workflowId}`);
    }

    // 创建执行记录
    const execution = this.executionRepo.create({
      organizationId: context.organizationId,
      workflowId,
      status: WorkflowExecutionStatus.PENDING,
      triggerType: workflow.triggerType,
      triggeredBy: context.triggeredBy || 'system',
      context,
      startedAt: new Date(),
    });
    await this.executionRepo.save(execution);

    // 更新状态为运行中
    execution.status = WorkflowExecutionStatus.RUNNING;
    await this.executionRepo.save(execution);

    const actionResults: WorkflowActionResult[] = [];
    let hasError = false;
    let lastError: string | undefined;

    try {
      // 按顺序执行每个动作
      for (let i = 0; i < workflow.actions.length; i++) {
        const action = workflow.actions[i];
        const actionStartTime = Date.now();

        const result = await this.actionExecutor.executeAction(action, context);

        const actionResult: WorkflowActionResult = {
          actionIndex: i,
          actionType: action.type,
          success: result.success,
          result: result.result,
          error: result.error,
          duration: Date.now() - actionStartTime,
        };

        actionResults.push(actionResult);

        if (!result.success) {
          hasError = true;
          lastError = result.error;
          
          // 如果设置了 continueOnError，继续执行
          if (!action.continueOnError) {
            break;
          }
        }
      }

      // 更新工作流统计
      workflow.executionCount += 1;
      workflow.lastExecutedAt = new Date();
      await this.workflowRepo.save(workflow);

      // 更新执行记录
      execution.status = hasError ? WorkflowExecutionStatus.FAILED : WorkflowExecutionStatus.SUCCESS;
      execution.result = { completedActions: actionResults.length };
      execution.error = lastError || null;
      execution.actionResults = actionResults;
      execution.completedAt = new Date();
      execution.duration = Date.now() - startTime;
      await this.executionRepo.save(execution);

      return {
        success: !hasError,
        executionId: execution.id,
        actionResults,
        error: lastError,
        duration: execution.duration,
      };
    } catch (error) {
      this.logger.error(`Workflow execution failed: ${error.message}`, error.stack);
      
      execution.status = WorkflowExecutionStatus.FAILED;
      execution.error = error.message;
      execution.completedAt = new Date();
      execution.duration = Date.now() - startTime;
      await this.executionRepo.save(execution);

      return {
        success: false,
        executionId: execution.id,
        actionResults,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 处理触发事件
   */
  async handleTrigger(triggerType: WorkflowTriggerType, context: ExecutionContext): Promise<void> {
    this.logger.log(`Handling trigger: ${triggerType}`);

    // 查找所有匹配该触发类型且已启用的工作流
    const workflows = await this.workflowRepo.find({
      where: {
        triggerType,
        isEnabled: true,
        organizationId: context.organizationId,
      },
    });

    this.logger.log(`Found ${workflows.length} workflows for trigger ${triggerType}`);

    // 遍历执行匹配的工作流
    for (const workflow of workflows) {
      try {
        if (this.evaluateConditions(workflow, context)) {
          this.logger.log(`Executing workflow ${workflow.id}: ${workflow.name}`);
          await this.execute(workflow.id, context);
        } else {
          this.logger.log(`Workflow ${workflow.id} conditions not met, skipping`);
        }
      } catch (error) {
        this.logger.error(`Failed to execute workflow ${workflow.id}: ${error.message}`);
      }
    }
  }

  /**
   * 链式执行 - 执行完成后触发另一个工作流
   */
  async chainExecute(
    workflowId: string,
    context: ExecutionContext,
    chainWorkflowId?: string,
  ): Promise<ExecutionResult> {
    const result = await this.execute(workflowId, context);

    if (result.success && chainWorkflowId) {
      const chainContext = {
        ...context,
        previousExecutionId: result.executionId,
        previousResult: result,
      };
      
      return await this.execute(chainWorkflowId, chainContext);
    }

    return result;
  }

  /**
   * 获取工作流执行历史
   */
  async getExecutionHistory(
    organizationId: string,
    options?: {
      workflowId?: string;
      status?: WorkflowExecutionStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ items: WorkflowExecution[]; total: number }> {
    const where: any = { organizationId };

    if (options?.workflowId) {
      where.workflowId = options.workflowId;
    }
    if (options?.status) {
      where.status = options.status;
    }

    const [items, total] = await this.executionRepo.findAndCount({
      where,
      order: { startedAt: 'DESC' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });

    return { items, total };
  }
}
