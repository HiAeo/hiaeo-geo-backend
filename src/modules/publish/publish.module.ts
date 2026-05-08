import { Module } from '@nestjs/common';
import { PublishController } from './controllers/publish.controller';
import { PublishService } from './services/publish.service';

@Module({
  controllers: [PublishController],
  providers: [PublishService],
  exports: [PublishService]
})
export class PublishModule {}
