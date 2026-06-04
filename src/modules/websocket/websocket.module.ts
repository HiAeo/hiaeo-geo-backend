import { Module } from '@nestjs/common';
import { RealtimeGateway } from './websocket.gateway';
import { AgentModule } from '../agent/agent.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [
    AgentModule,
    SchedulerModule,
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class WebSocketModule {}
