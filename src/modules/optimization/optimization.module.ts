import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptimizationSuggestion, Competitor, OptimizationExecution } from './entities';
import { OptimizationSuggestionRepository } from './repositories/optimization-suggestion.repository';
import { CompetitorRepository } from './repositories/competitor.repository';
import { OptimizationExecutionRepository } from './repositories/optimization-execution.repository';
import { DiagnosisOptimizationService } from './services/diagnosis-optimization.service';
import { CompetitorAutoTrackService } from './services/competitor-auto-track.service';
import { RAGDiagnosisService } from './services/rag-diagnosis.service';
import { OptimizationPersistenceService } from './services/optimization-persistence.service';
import { ScheduledCompetitorTrackingService } from './services/scheduled-competitor-tracking.service';
import { EffectTrackingService } from './services/effect-tracking.service';
import { OptimizationController } from './controllers/optimization.controller';
import { DiagnosisModule } from '../diagnosis/diagnosis.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { AiModule } from '../ai/ai.module';
import { BrandModule } from '../brand/brand.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { DiagnosisReport } from '../diagnosis/entities/diagnosis-report.entity';
import { Brand } from '../brand/entities/brand.entity';
import { BrandKnowledgeBase } from '../knowledge/entities/brand-knowledge-base.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OptimizationSuggestion,
      Competitor,
      OptimizationExecution,
      DiagnosisReport,
      Brand,
      BrandKnowledgeBase,
    ]),
    DiagnosisModule,
    KnowledgeModule,
    AiModule,
    BrandModule,
    IntelligenceModule,
  ],
  controllers: [OptimizationController],
  providers: [
    OptimizationSuggestionRepository,
    CompetitorRepository,
    OptimizationExecutionRepository,
    DiagnosisOptimizationService,
    CompetitorAutoTrackService,
    RAGDiagnosisService,
    OptimizationPersistenceService,
    ScheduledCompetitorTrackingService,
    EffectTrackingService,
  ],
  exports: [
    DiagnosisOptimizationService,
    CompetitorAutoTrackService,
    RAGDiagnosisService,
    OptimizationPersistenceService,
    ScheduledCompetitorTrackingService,
    EffectTrackingService,
  ],
})
export class OptimizationModule {}
