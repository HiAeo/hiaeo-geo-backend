import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './config/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BrandModule } from './modules/brand/brand.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { AiModule } from './modules/ai/ai.module';
import { HubModule } from './modules/hub/hub.module';
import { ContentModule } from './modules/content/content.module';
import { PublishModule } from './modules/publish/publish.module';
import { DiagnosisModule } from './modules/diagnosis/diagnosis.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PackageModule } from './modules/package/package.module';
import { OrderModule } from './modules/order/order.module';
import { BillingModule } from './modules/billing/billing.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ApiGatewayModule } from './modules/api-gateway/api-gateway.module';
import { SemanticModule } from './modules/semantic/semantic.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { TeamModule } from './modules/team/team.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { WorkflowStateModule } from './modules/workflow-state/workflow-state.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { OptimizationModule } from './modules/optimization/optimization.module';
import { XiaoZhiModule } from './modules/xiaozhi/xiaozhi.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    BrandModule,
    StrategyModule,
    AiModule,
    HubModule,
    ContentModule,
    PublishModule,
    DiagnosisModule,
    SubscriptionModule,
    PackageModule,
    OrderModule,
    BillingModule,
    PaymentModule,
    NotificationModule,
    ApiGatewayModule,
    SemanticModule,
    InvitationModule,
    TeamModule,
    KnowledgeModule,
    WorkflowModule,
    WorkflowStateModule,
    IntelligenceModule,
    OptimizationModule,
    I18nModule,
    XiaoZhiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
