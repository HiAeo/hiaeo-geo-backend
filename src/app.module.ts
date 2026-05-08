import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BrandModule } from './modules/brand/brand.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { AiModule } from './modules/ai/ai.module';
import { HubModule } from './modules/hub/hub.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UserModule,
    BrandModule,
    StrategyModule,
    AiModule,
    HubModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
