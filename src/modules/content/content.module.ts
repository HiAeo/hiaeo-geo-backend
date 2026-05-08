import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';
import { ContentAuditService } from './services/content-audit.service';
import { Content } from './entities/content.entity';
import { ContentAudit } from './entities/content-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Content, ContentAudit])],
  controllers: [ContentController],
  providers: [ContentService, ContentAuditService],
  exports: [ContentService]
})
export class ContentModule {}
