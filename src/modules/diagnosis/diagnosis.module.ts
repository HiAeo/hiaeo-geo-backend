import { Module } from '@nestjs/common';
import { DiagnosisController } from './controllers/diagnosis.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [DiagnosisController],
  providers: [],
  exports: [],
})
export class DiagnosisModule {}
