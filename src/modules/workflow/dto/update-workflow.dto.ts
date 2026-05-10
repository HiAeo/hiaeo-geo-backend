"use strict";
import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowTriggerType } from '../entities/workflow-definition.entity';
import { WorkflowConditionDto, WorkflowActionDto } from './create-workflow.dto';

/**
 * 更新工作流DTO
 */
export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkflowTriggerType)
  triggerType?: WorkflowTriggerType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConditionDto)
  conditions?: WorkflowConditionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions?: WorkflowActionDto[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
