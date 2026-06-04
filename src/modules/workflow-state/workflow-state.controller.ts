import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowStateService } from './workflow-state.service';
import { UpdateWorkflowStateDto, UpdateModuleStateDto, SetLastIdDto } from './dto/update-workflow-state.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('工作流状态')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/workflow')
export class WorkflowStateController {
  constructor(private readonly workflowStateService: WorkflowStateService) {}

  @Get('state/:brandId')
  @ApiOperation({ summary: '获取品牌工作流状态' })
  async getWorkflowState(@Param('brandId') brandId: string) {
    const state = await this.workflowStateService.getWorkflowState(brandId);
    const summary = await this.workflowStateService.getWorkflowSummary(brandId);

    return {
      code: 0,
      data: {
        state,
        summary,
      },
      message: 'success',
    };
  }

  @Post('init/:brandId')
  @ApiOperation({ summary: '初始化品牌工作流状态' })
  async initializeWorkflowState(@Param('brandId') brandId: string) {
    const state = await this.workflowStateService.initializeWorkflowState(brandId);

    return {
      code: 0,
      data: state,
      message: 'success',
    };
  }

  @Put('state/:brandId')
  @ApiOperation({ summary: '批量更新工作流状态' })
  async updateWorkflowState(
    @Param('brandId') brandId: string,
    @Body() dto: UpdateWorkflowStateDto,
  ) {
    const state = await this.workflowStateService.updateWorkflowState(brandId, dto);

    return {
      code: 0,
      data: state,
      message: 'success',
    };
  }

  @Put('module/:brandId')
  @ApiOperation({ summary: '更新单个模块状态' })
  async updateModuleState(
    @Param('brandId') brandId: string,
    @Body() dto: UpdateModuleStateDto,
  ) {
    const state = await this.workflowStateService.updateModuleState(brandId, dto);
    const summary = await this.workflowStateService.getWorkflowSummary(brandId);

    return {
      code: 0,
      data: {
        state,
        summary,
      },
      message: 'success',
    };
  }

  @Put('last-id/:brandId')
  @ApiOperation({ summary: '设置最近执行的ID' })
  async setLastId(
    @Param('brandId') brandId: string,
    @Body() dto: SetLastIdDto,
  ) {
    const state = await this.workflowStateService.setLastId(brandId, dto);

    return {
      code: 0,
      data: state,
      message: 'success',
    };
  }

  @Get('module/:brandId/:module')
  @ApiOperation({ summary: '获取单个模块状态' })
  async getModuleState(
    @Param('brandId') brandId: string,
    @Param('module') module: string,
  ) {
    const state = await this.workflowStateService.getModuleState(brandId, module);
    const canExecute = await this.workflowStateService.canModuleExecute(brandId, module);

    return {
      code: 0,
      data: {
        module,
        state,
        canExecute,
      },
      message: 'success',
    };
  }

  @Get('can-execute/:brandId/:module')
  @ApiOperation({ summary: '检查模块是否可以执行' })
  async canModuleExecute(
    @Param('brandId') brandId: string,
    @Param('module') module: string,
  ) {
    const canExecute = await this.workflowStateService.canModuleExecute(brandId, module);

    return {
      code: 0,
      data: {
        module,
        canExecute,
      },
      message: 'success',
    };
  }

  @Get('summary/:brandId')
  @ApiOperation({ summary: '获取工作流进度摘要' })
  async getWorkflowSummary(@Param('brandId') brandId: string) {
    const summary = await this.workflowStateService.getWorkflowSummary(brandId);

    return {
      code: 0,
      data: summary,
      message: 'success',
    };
  }

  @Post('reset/:brandId')
  @ApiOperation({ summary: '重置工作流状态' })
  async resetWorkflowState(
    @Param('brandId') brandId: string,
    @Body() body: { fromModule?: string },
  ) {
    const state = await this.workflowStateService.resetWorkflowState(brandId, body.fromModule);

    return {
      code: 0,
      data: state,
      message: 'success',
    };
  }
}
