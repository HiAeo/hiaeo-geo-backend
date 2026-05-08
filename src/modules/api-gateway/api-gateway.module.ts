"use strict";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey, ApiUsageLog } from './entities';
import { ApiKeyService } from './services';
import { ApiGatewayController } from './controllers/api-gateway.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, ApiUsageLog])],
  controllers: [ApiGatewayController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiGatewayModule {}
