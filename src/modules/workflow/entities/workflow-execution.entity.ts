"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkflowDefinition } from './workflow-definition.entity';

/**
 * 工作流执行状态
 */
export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',     // 待执行
  RUNNING = 'RUNNING',     // 执行中
  SUCCESS = 'SUCCESS',     // 成功
  FAILED = 'FAILED',       // 失败
  CANCELLED = 'CANCELLED', // 已取消
}

/**
 * 工作流执行记录实体
 */
@Entity('workflow_executions')
@Index(['workflowId', 'startedAt'])
@Index(['organizationId', 'startedAt'])
@Index(['status'])
export class WorkflowExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  workflowId: string;

  @ManyToOne(() => WorkflowDefinition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: WorkflowDefinition;

  @Column({ type: 'simple-enum', enum: WorkflowExecutionStatus, default: WorkflowExecutionStatus.PENDING })
  status: WorkflowExecutionStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  triggerType: string;  // 触发类型

  @Column({ type: 'varchar', length: 255, nullable: true })
  triggeredBy: string;  // 触发源

  @Column({ type: 'json', nullable: true })
  context: Record<string, any>;  // 触发上下文

  @Column({ type: 'json', nullable: true })
  result: Record<string, any>;  // 执行结果

  @Column({ type: 'text', nullable: true })
  error: string | null;  // 错误信息

  @Column({ type: 'json', nullable: true })
  actionResults: WorkflowActionResult[];  // 各动作执行结果

  @Column({ type: 'int', default: 0 })
  duration: number;  // 执行耗时(毫秒)

  @Column({ type: 'datetime' })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * 工作流动作执行结果
 */
export interface WorkflowActionResult {
  actionIndex: number;
  actionType: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}
