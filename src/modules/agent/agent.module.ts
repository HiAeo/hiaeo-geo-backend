import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentService } from './services/agent.service';
import { AgentController } from './controllers/agent.controller';
import { WorkflowOrchestratorService } from './services/workflow-orchestrator.service';
import { WorkflowStateService } from '../workflow-state/workflow-state.service';
import { WorkflowStateModule } from '../workflow-state/workflow-state.module';
import { Brand } from '../brand/entities/brand.entity';
import { DiagnosisTask } from '../diagnosis/entities/diagnosis-task.entity';
import { DiagnosisReport } from '../diagnosis/entities/diagnosis-report.entity';
import { Strategy } from '../strategy/entities/strategy.entity';
import { Content } from '../content/entities/content.entity';
import { DiagnosisTaskService } from '../diagnosis/services/diagnosis-task.service';
import { ReportGeneratorService } from '../diagnosis/services/report-generator.service';
import { StrategyService } from '../strategy/services/strategy.service';
import { ContentService } from '../content/services/content.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brand,
      DiagnosisTask,
      DiagnosisReport,
      Strategy,
      Content,
    ]),
    AiModule,
    WorkflowStateModule,
  ],
  controllers: [AgentController],
  providers: [AgentService, WorkflowOrchestratorService],
  exports: [AgentService, WorkflowOrchestratorService],
})
export class AgentModule {}
