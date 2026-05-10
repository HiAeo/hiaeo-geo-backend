import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BrandKnowledgeBase } from './entities/brand-knowledge-base.entity';
import { DiagnosisReport } from '../diagnosis/entities/diagnosis-report.entity';
import { KnowledgeService } from './services/knowledge.service';
import { KnowledgeController } from './controllers/knowledge.controller';
import { VectorController } from './controllers/vector.controller';
import { EmbeddingService } from './services/embedding.service';
import { EnhancedAiSuggestionService } from './services/enhanced-ai-suggestion.service';
import { IncrementalDiagnosisTriggerService } from './services/incremental-diagnosis-trigger.service';
import { VectorStorageService } from './services/vector-storage.service';
import { KnowledgeDiagnosisIntegrationService } from './services/knowledge-diagnosis-integration.service';
import { VectorHealthService } from '../../services/vector-health.service';
import { AiModule } from '../ai/ai.module';
import { DiagnosisModule } from '../diagnosis/diagnosis.module';
import { AuthModule } from '../auth/auth.module';
import { PERMISSIONS } from '../auth/constants/permissions.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([BrandKnowledgeBase, DiagnosisReport]),
    MulterModule.register({
      dest: './uploads/knowledge',
    }),
    forwardRef(() => AiModule),
    forwardRef(() => DiagnosisModule),
    AuthModule,
  ],
  controllers: [KnowledgeController, VectorController],
  providers: [
    KnowledgeService,
    EmbeddingService,
    EnhancedAiSuggestionService,
    IncrementalDiagnosisTriggerService,
    VectorStorageService,
    KnowledgeDiagnosisIntegrationService,
    VectorHealthService,
  ],
  exports: [KnowledgeService, VectorStorageService, KnowledgeDiagnosisIntegrationService, VectorHealthService],
})
export class KnowledgeModule {}
