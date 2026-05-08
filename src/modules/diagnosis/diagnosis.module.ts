import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosisController } from './controllers/diagnosis.controller';
import { DiagnosisTask } from './entities/diagnosis-task.entity';
import { DiagnosisReport } from './entities/diagnosis-report.entity';
import { DiagnosisTaskService } from './services/diagnosis-task.service';
import { DiagnosisExecutorService } from './services/diagnosis-executor.service';
import { HealthScoreCalculatorService } from './services/health-score-calculator.service';
import { CompetitorAnalyzerService } from './services/competitor-analyzer.service';
import { IssueIdentifierService } from './services/issue-identifier.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiagnosisTask, DiagnosisReport]),
    forwardRef(() => AiModule),
  ],
  controllers: [DiagnosisController],
  providers: [
    DiagnosisTaskService,
    DiagnosisExecutorService,
    HealthScoreCalculatorService,
    CompetitorAnalyzerService,
    IssueIdentifierService,
    ReportGeneratorService,
  ],
  exports: [
    DiagnosisTaskService,
    DiagnosisExecutorService,
    HealthScoreCalculatorService,
    CompetitorAnalyzerService,
    IssueIdentifierService,
    ReportGeneratorService,
  ],
})
export class DiagnosisModule {}
