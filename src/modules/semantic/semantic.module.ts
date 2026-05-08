import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemanticController } from './controllers/semantic.controller';
import { SemanticService } from './services/semantic.service';
import { SemanticEntityService } from './services/semantic-entity.service';
import { TemplateService } from './services/template.service';
import { StyleAdapterService } from './services/style-adapter.service';
import { SemanticEntity } from './entities/semantic-entity.entity';
import { ContentTemplate } from './entities/content-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SemanticEntity, ContentTemplate])],
  controllers: [SemanticController],
  providers: [SemanticService, SemanticEntityService, TemplateService, StyleAdapterService],
  exports: [SemanticService]
})
export class SemanticModule {}
