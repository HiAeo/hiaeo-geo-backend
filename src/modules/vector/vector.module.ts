import { Module } from '@nestjs/common';
import { VectorService } from './services/vector.service';
import { EmbeddingService } from './services/embedding.service';
import { VectorController } from './controllers/vector.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [VectorController],
  providers: [VectorService, EmbeddingService],
  exports: [VectorService, EmbeddingService],
})
export class VectorModule {}
