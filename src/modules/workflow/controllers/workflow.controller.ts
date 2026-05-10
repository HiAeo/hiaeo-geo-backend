"use strict";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkflowService } from '../services/workflow.service';
import { WorkflowEngine } from '../services/workflow-engine.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../dto';
import { WorkflowExecutionStatus } from '../entities';

/**
 * 工作流控制器
 */
@Controller('v1/workflow')
@UseGuards(AuthGuard('jwt'))
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowEngine: WorkflowEngine,
  ) {}

  /**
   * 创建工作流
   */
  @Post()
  async create(
    @Body() dto: CreateWorkflowDto,
    @Query('organizationId') organizationId: string,
  ) {
    return this.workflowService.create(organizationId, dto);
  }

  /**
   * 获取工作流列表
   */
  @Get()
  async findAll(
    @Query('organizationId') organizationId: string,
    @Query('triggerType') triggerType?: string,
    @Query('isEnabled') isEnabled?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.workflowService.findByOrganization(organizationId, {
      triggerType,
      isEnabled: isEnabled !== undefined ? isEnabled === 'true' : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  /**
   * 获取工作流详情
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workflowService.findById(id);
  }

  /**
   * 更新工作流
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowService.update(id, dto);
  }

  /**
   * 删除工作流
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.workflowService.delete(id);
  }

  /**
   * 手动执行工作流
   */
  @Post(':id/execute')
  async execute(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
    @Body() context?: Record<string, any>,
  ) {
    return this.workflowEngine.execute(id, {
      organizationId,
      triggeredBy: 'manual',
      ...context,
    });
  }

  /**
   * 获取执行历史
   */
  @Get('executions/history')
  async getExecutionHistory(
    @Query('organizationId') organizationId: string,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: WorkflowExecutionStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.workflowEngine.getExecutionHistory(organizationId, {
      workflowId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}
