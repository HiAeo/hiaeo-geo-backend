import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublishController } from './controllers/publish.controller';
import { PublishService } from './services/publish.service';
import { PlatformConfigService } from './platforms/platform-config.service';
import { PublishRecord } from '../content/entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublishRecord]),
    AuthModule,
  ],
  controllers: [PublishController],
  providers: [PublishService, PlatformConfigService],
  exports: [PublishService, PlatformConfigService],
})
export class PublishModule {}
