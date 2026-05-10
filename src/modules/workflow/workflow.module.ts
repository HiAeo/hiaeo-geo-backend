"use strict";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowDefinition, WorkflowExecution } from './entities';
import { WorkflowService, WorkflowEngine, TriggerService, ActionExecutorService } from './services';
import { WorkflowController } from './controllers';

/**
 * 工作流模块 - 实现知识库自动化工作流引擎
 */
@Module({
  imports: [TypeOrmModule.forFeature([WorkflowDefinition, WorkflowExecution])],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowEngine,
    TriggerService,
    ActionExecutorService,
  ],
  exports: [
    WorkflowService,
    WorkflowEngine,
    TriggerService,
    ActionExecutorService,
  ],
})
export class WorkflowModule {}
