"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 工作流触发类型
 */
export enum WorkflowTriggerType {
  KNOWLEDGE_UPDATED = 'KNOWLEDGE_UPDATED',      // 知识库更新时触发
  DIAGNOSIS_COMPLETED = 'DIAGNOSIS_COMPLETED',  // 诊断完成时触发
  INDEX_REBUILT = 'INDEX_REBUILT',              // 索引重建完成时触发
  SCHEDULED = 'SCHEDULED',                      // 定时触发
}

/**
 * 工作流定义实体
 */
@Entity('workflow_definitions')
@Index(['organizationId', 'isEnabled'])
@Index(['triggerType'])
export class WorkflowDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: WorkflowTriggerType })
  triggerType: WorkflowTriggerType;

  @Column({ type: 'json', nullable: true })
  conditions: WorkflowCondition[];  // 触发条件

  @Column({ type: 'json' })
  actions: WorkflowAction[];  // 执行动作数组

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  executionCount: number;  // 执行次数

  @Column({ type: 'datetime', nullable: true })
  lastExecutedAt: Date;  // 最后执行时间

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * 工作流条件
 */
export interface WorkflowCondition {
  field: string;       // 条件字段
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn';
  value: any;
}

/**
 * 工作流动作
 */
export interface WorkflowAction {
  type: 'sendNotification' | 'rebuildIndex' | 'triggerDiagnosis' | 'updateKnowledge' | 'callWebhook';
  params: Record<string, any>;
  continueOnError?: boolean;  // 错误时是否继续
}
