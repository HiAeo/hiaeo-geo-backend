import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrategyController } from './controllers/strategy.controller';
import { MofaStrategyController } from './controllers/mofa-strategy.controller';
import { StrategyService } from './services/strategy.service';
import { MofaStrategyService } from './services/mofa-strategy.service';
import { KnowledgeAwareStrategyService } from './services/knowledge-aware-strategy.service';
import { Strategy } from './entities/strategy.entity';
import { BrandKnowledgeBase } from '../knowledge/entities/brand-knowledge-base.entity';
import { DiagnosisModule } from '../diagnosis/diagnosis.module';
import { AiModule } from '../ai/ai.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Strategy, BrandKnowledgeBase]),
    DiagnosisModule,
    AiModule,
    forwardRef(() => KnowledgeModule),
  ],
  controllers: [StrategyController, MofaStrategyController],
  providers: [StrategyService, MofaStrategyService, KnowledgeAwareStrategyService],
  exports: [StrategyService, MofaStrategyService, KnowledgeAwareStrategyService],
})
export class StrategyModule {}
