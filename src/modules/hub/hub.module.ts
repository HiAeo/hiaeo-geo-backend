import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HubController } from './controllers/hub.controller';
import { HubService } from './services/hub.service';
import { DataSourceService } from './services/data-source.service';
import { KnowledgeDataSourceService } from './services/knowledge-data-source.service';
import { User } from '../user/entities/user.entity';
import { Organization } from '../user/entities/organization.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Order } from '../order/entities/order.entity';
import { Content } from '../content/entities/content.entity';
import { DiagnosisTask } from '../diagnosis/entities/diagnosis-task.entity';
import { DiagnosisReport } from '../diagnosis/entities/diagnosis-report.entity';
import { Brand } from '../brand/entities/brand.entity';
import { BrandKnowledgeBase } from '../knowledge/entities/brand-knowledge-base.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      Subscription,
      Order,
      Content,
      DiagnosisTask,
      DiagnosisReport,
      Brand,
      BrandKnowledgeBase,
    ]),
  ],
  controllers: [HubController],
  providers: [HubService, DataSourceService, KnowledgeDataSourceService],
  exports: [HubService, KnowledgeDataSourceService],
})
export class HubModule {}
