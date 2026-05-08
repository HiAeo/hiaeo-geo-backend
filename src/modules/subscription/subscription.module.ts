import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Credit } from './entities/credit.entity';
import { CreditTransaction } from './entities/credit.entity';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { CreditService } from './services/credit.service';
import { CreditController } from './controllers/credit.controller';
import { PackageModule } from '../package/package.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Credit, CreditTransaction]),
    PackageModule,
  ],
  controllers: [SubscriptionController, CreditController],
  providers: [SubscriptionService, CreditService],
  exports: [SubscriptionService, CreditService],
})
export class SubscriptionModule {}
