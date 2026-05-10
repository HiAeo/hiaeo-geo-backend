"use strict";
import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowTriggerType } from '../entities/workflow-definition.entity';

/**
 * 工作流条件DTO
 */
export class WorkflowConditionDto {
  @IsString()
  field: string;

  @IsString()
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn';

  value: any;
}

/**
 * 工作流动作DTO
 */
export class WorkflowActionDto {
  @IsEnum(['sendNotification', 'rebuildIndex', 'triggerDiagnosis', 'updateKnowledge', 'callWebhook'])
  type: 'sendNotification' | 'rebuildIndex' | 'triggerDiagnosis' | 'updateKnowledge' | 'callWebhook';

  params: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  continueOnError?: boolean;
}

/**
 * 创建工作流DTO
 */
export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(WorkflowTriggerType)
  triggerType: WorkflowTriggerType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConditionDto)
  conditions?: WorkflowConditionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions: WorkflowActionDto[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
