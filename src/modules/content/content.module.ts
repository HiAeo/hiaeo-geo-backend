import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';
import { ContentAuditService } from './services/content-audit.service';
import { ContentGeneratorService } from './services/content-generator.service';
import { KnowledgeAwareContentService } from './services/knowledge-aware-content.service';
import { Content, ContentAudit, PublishRecord, MofaStrategy } from './entities';
import { BrandKnowledgeBase } from '../knowledge/entities/brand-knowledge-base.entity';
import { AiModule } from '../ai/ai.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, ContentAudit, PublishRecord, MofaStrategy, BrandKnowledgeBase]),
    AiModule,
    forwardRef(() => KnowledgeModule),
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentAuditService, ContentGeneratorService, KnowledgeAwareContentService],
  exports: [ContentService, ContentGeneratorService, KnowledgeAwareContentService],
})
export class ContentModule {}
