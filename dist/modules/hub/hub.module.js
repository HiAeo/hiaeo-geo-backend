"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const hub_controller_1 = require("./controllers/hub.controller");
const hub_service_1 = require("./services/hub.service");
const data_source_service_1 = require("./services/data-source.service");
const knowledge_data_source_service_1 = require("./services/knowledge-data-source.service");
const user_entity_1 = require("../user/entities/user.entity");
const organization_entity_1 = require("../user/entities/organization.entity");
const subscription_entity_1 = require("../subscription/entities/subscription.entity");
const order_entity_1 = require("../order/entities/order.entity");
const content_entity_1 = require("../content/entities/content.entity");
const diagnosis_task_entity_1 = require("../diagnosis/entities/diagnosis-task.entity");
const diagnosis_report_entity_1 = require("../diagnosis/entities/diagnosis-report.entity");
const brand_entity_1 = require("../brand/entities/brand.entity");
const brand_knowledge_base_entity_1 = require("../knowledge/entities/brand-knowledge-base.entity");
let HubModule = class HubModule {
};
exports.HubModule = HubModule;
exports.HubModule = HubModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                organization_entity_1.Organization,
                subscription_entity_1.Subscription,
                order_entity_1.Order,
                content_entity_1.Content,
                diagnosis_task_entity_1.DiagnosisTask,
                diagnosis_report_entity_1.DiagnosisReport,
                brand_entity_1.Brand,
                brand_knowledge_base_entity_1.BrandKnowledgeBase,
            ]),
        ],
        controllers: [hub_controller_1.HubController],
        providers: [hub_service_1.HubService, data_source_service_1.DataSourceService, knowledge_data_source_service_1.KnowledgeDataSourceService],
        exports: [hub_service_1.HubService, knowledge_data_source_service_1.KnowledgeDataSourceService],
    })
], HubModule);
//# sourceMappingURL=hub.module.js.map