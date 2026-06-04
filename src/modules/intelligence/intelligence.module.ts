import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { QichachaService } from './qichacha.service';
import { AIModelService } from './ai-model.service';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, QichachaService, AIModelService],
  exports: [IntelligenceService, QichachaService, AIModelService],
})
export class IntelligenceModule {}
