"use strict";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, EnterpriseTransfer } from './entities';
import { BillingService } from './services';
import { BillingController } from './controllers/billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, EnterpriseTransfer])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
