"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./config/config.module");
const database_module_1 = require("./config/database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const brand_module_1 = require("./modules/brand/brand.module");
const strategy_module_1 = require("./modules/strategy/strategy.module");
const ai_module_1 = require("./modules/ai/ai.module");
const hub_module_1 = require("./modules/hub/hub.module");
const content_module_1 = require("./modules/content/content.module");
const publish_module_1 = require("./modules/publish/publish.module");
const diagnosis_module_1 = require("./modules/diagnosis/diagnosis.module");
const subscription_module_1 = require("./modules/subscription/subscription.module");
const package_module_1 = require("./modules/package/package.module");
const order_module_1 = require("./modules/order/order.module");
const billing_module_1 = require("./modules/billing/billing.module");
const payment_module_1 = require("./modules/payment/payment.module");
const notification_module_1 = require("./modules/notification/notification.module");
const api_gateway_module_1 = require("./modules/api-gateway/api-gateway.module");
const semantic_module_1 = require("./modules/semantic/semantic.module");
const invitation_module_1 = require("./modules/invitation/invitation.module");
const team_module_1 = require("./modules/team/team.module");
const knowledge_module_1 = require("./modules/knowledge/knowledge.module");
const workflow_module_1 = require("./modules/workflow/workflow.module");
const i18n_module_1 = require("./modules/i18n/i18n.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            brand_module_1.BrandModule,
            strategy_module_1.StrategyModule,
            ai_module_1.AiModule,
            hub_module_1.HubModule,
            content_module_1.ContentModule,
            publish_module_1.PublishModule,
            diagnosis_module_1.DiagnosisModule,
            subscription_module_1.SubscriptionModule,
            package_module_1.PackageModule,
            order_module_1.OrderModule,
            billing_module_1.BillingModule,
            payment_module_1.PaymentModule,
            notification_module_1.NotificationModule,
            api_gateway_module_1.ApiGatewayModule,
            semantic_module_1.SemanticModule,
            invitation_module_1.InvitationModule,
            team_module_1.TeamModule,
            knowledge_module_1.KnowledgeModule,
            workflow_module_1.WorkflowModule,
            i18n_module_1.I18nModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map