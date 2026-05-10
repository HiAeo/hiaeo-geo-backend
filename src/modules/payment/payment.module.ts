import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../order/entities/payment.entity';
import { Coupon, UserCoupon } from '../order/entities/coupon.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { OrderModule } from '../order/order.module';
import { SubscriptionModule } from '../subscription/subscription.module';

import { PaymentController } from './payment.controller';
import { PaymentConfigService } from './providers/payment-config.service';
import { PaymentSecurityService } from './security/payment-security.service';
import { AlipayProvider } from './providers/alipay.provider';
import { WechatProvider } from './providers/wechat.provider';
import { PaymentTaskService } from './tasks/payment-tasks.service';
import { PromotionService } from './promotion/promotion.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Payment,
      Coupon,
      UserCoupon,
      Subscription,
    ]),
    ScheduleModule.forRoot(),
    OrderModule,
    SubscriptionModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentConfigService,
    PaymentSecurityService,
    AlipayProvider,
    WechatProvider,
    PaymentTaskService,
    PromotionService,
  ],
  exports: [
    PaymentConfigService,
    PaymentSecurityService,
    AlipayProvider,
    WechatProvider,
    PromotionService,
  ],
})
export class PaymentModule {}
