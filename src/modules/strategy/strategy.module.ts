import { Module } from '@nestjs/common';
import { StrategyController } from './controllers/strategy.controller';
import { StrategyService } from './services/strategy.service';

@Module({
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [StrategyService]
})
export class StrategyModule {}
