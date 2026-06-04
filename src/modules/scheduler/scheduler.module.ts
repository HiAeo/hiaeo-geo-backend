import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './controllers/scheduler.controller';
import { Brand } from '../brand/entities/brand.entity';
import { DiagnosisTask } from '../diagnosis/entities/diagnosis-task.entity';
import { Notification } from '../notification/entities/notification.entity';
import { WorkflowStateModule } from '../workflow-state/workflow-state.module';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Brand, DiagnosisTask, Notification]),
    WorkflowStateModule,
    AgentModule,
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
