"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const credit_entity_1 = require("./entities/credit.entity");
const credit_entity_2 = require("./entities/credit.entity");
const subscription_service_1 = require("./services/subscription.service");
const subscription_controller_1 = require("./controllers/subscription.controller");
const credit_service_1 = require("./services/credit.service");
const credit_controller_1 = require("./controllers/credit.controller");
const package_module_1 = require("../package/package.module");
let SubscriptionModule = class SubscriptionModule {
};
exports.SubscriptionModule = SubscriptionModule;
exports.SubscriptionModule = SubscriptionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([subscription_entity_1.Subscription, credit_entity_1.Credit, credit_entity_2.CreditTransaction]),
            package_module_1.PackageModule,
        ],
        controllers: [subscription_controller_1.SubscriptionController, credit_controller_1.CreditController],
        providers: [subscription_service_1.SubscriptionService, credit_service_1.CreditService],
        exports: [subscription_service_1.SubscriptionService, credit_service_1.CreditService],
    })
], SubscriptionModule);
//# sourceMappingURL=subscription.module.js.map