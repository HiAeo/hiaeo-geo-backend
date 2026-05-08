import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';
import { ContentAuditService } from './services/content-audit.service';
import { ContentGeneratorService } from './services/content-generator.service';
import { Content } from './entities/content.entity';
import { ContentAudit } from './entities/content-audit.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, ContentAudit]),
    AiModule,
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentAuditService, ContentGeneratorService],
  exports: [ContentService, ContentGeneratorService],
})
export class ContentModule {}
