import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Payment, Refund } from './entities/payment.entity';
import { Coupon, UserCoupon } from './entities/coupon.entity';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { CouponService } from './services/coupon.service';
import { OrderController } from './controllers/order.controller';
import { PackageModule } from '../package/package.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { InvitationModule } from '../invitation/invitation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Payment, Refund, Coupon, UserCoupon]),
    PackageModule,
    SubscriptionModule,
    InvitationModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, PaymentService, CouponService],
  exports: [OrderService, PaymentService, CouponService],
})
export class OrderModule {}
