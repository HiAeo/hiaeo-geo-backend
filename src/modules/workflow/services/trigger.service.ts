"use strict";
import { Injectable, Logger } from '@nestjs/common';
import { WorkflowEngine, ExecutionContext } from './workflow-engine.service';
import { WorkflowTriggerType } from '../entities/workflow-definition.entity';

/**
 * 触发器服务 - 负责触发工作流执行
 */
@Injectable()
export class TriggerService {
  private readonly logger = new Logger(TriggerService.name);

  constructor(private readonly workflowEngine: WorkflowEngine) {}

  /**
   * 知识库更新时触发
   */
  async onKnowledgeUpdated(organizationId: string, knowledgeId: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.log(`Knowledge updated trigger: ${knowledgeId}`);
    await this.workflowEngine.handleTrigger(WorkflowTriggerType.KNOWLEDGE_UPDATED, {
      organizationId,
      knowledgeId,
      ...metadata,
    });
  }

  /**
   * 诊断完成时触发
   */
  async onDiagnosisCompleted(organizationId: string, knowledgeId: string, score: number, reportId?: string): Promise<void> {
    this.logger.log(`Diagnosis completed trigger: ${knowledgeId}, score: ${score}`);
    await this.workflowEngine.handleTrigger(WorkflowTriggerType.DIAGNOSIS_COMPLETED, {
      organizationId,
      knowledgeId,
      score,
      reportId,
    });
  }

  /**
   * 索引重建完成时触发
   */
  async onIndexRebuilt(organizationId: string, knowledgeId: string, indexType?: string): Promise<void> {
    this.logger.log(`Index rebuilt trigger: ${knowledgeId}`);
    await this.workflowEngine.handleTrigger(WorkflowTriggerType.INDEX_REBUILT, {
      organizationId,
      knowledgeId,
      indexType,
    });
  }

  /**
   * 定时触发
   */
  async onScheduled(organizationId: string, cronExpression: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.log(`Scheduled trigger: ${cronExpression}`);
    await this.workflowEngine.handleTrigger(WorkflowTriggerType.SCHEDULED, {
      organizationId,
      cronExpression,
      ...metadata,
    });
  }

  /**
   * 手动触发
   */
  async onManual(workflowId: string, organizationId: string, context?: Record<string, any>): Promise<void> {
    this.logger.log(`Manual trigger: ${workflowId}`);
    await this.workflowEngine.execute(workflowId, {
      ...context,
      organizationId,
      triggeredBy: 'manual',
    });
  }
}
