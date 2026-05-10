import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosisController } from './controllers/diagnosis.controller';
import { DiagnosisTaskService } from './services/diagnosis-task.service';
import { DiagnosisExecutorService } from './services/diagnosis-executor.service';
import { HealthScoreCalculatorService } from './services/health-score-calculator.service';
import { CompetitorAnalyzerService } from './services/competitor-analyzer.service';
import { IssueIdentifierService } from './services/issue-identifier.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { WebScraperService } from './services/web-scraper.service';
import { SEODiagnosisService } from './services/seo-diagnosis.service';
import { DiagnosisTask, DiagnosisReport } from './entities';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiagnosisTask, DiagnosisReport]),
    AiModule,
  ],
  controllers: [DiagnosisController],
  providers: [
    DiagnosisTaskService,
    DiagnosisExecutorService,
    HealthScoreCalculatorService,
    CompetitorAnalyzerService,
    IssueIdentifierService,
    ReportGeneratorService,
    WebScraperService,
    SEODiagnosisService,
  ],
  exports: [DiagnosisTaskService, WebScraperService, SEODiagnosisService],
})
export class DiagnosisModule {}
