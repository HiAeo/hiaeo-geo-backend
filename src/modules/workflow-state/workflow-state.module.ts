import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowStateController } from './workflow-state.controller';
import { WorkflowStateService } from './workflow-state.service';
import { Brand } from '../brand/entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [WorkflowStateController],
  providers: [WorkflowStateService],
  exports: [WorkflowStateService],
})
export class WorkflowStateModule {}
