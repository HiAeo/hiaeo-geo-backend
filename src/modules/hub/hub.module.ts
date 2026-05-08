import { Module } from '@nestjs/common'
import { HubController } from './controllers/hub.controller'
import { HubService } from './services/hub.service'

@Module({
  controllers: [HubController],
  providers: [HubService],
  exports: [HubService]
})
export class HubModule {}
