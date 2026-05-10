"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const content_controller_1 = require("./controllers/content.controller");
const content_service_1 = require("./services/content.service");
const content_audit_service_1 = require("./services/content-audit.service");
const content_generator_service_1 = require("./services/content-generator.service");
const knowledge_aware_content_service_1 = require("./services/knowledge-aware-content.service");
const entities_1 = require("./entities");
const brand_knowledge_base_entity_1 = require("../knowledge/entities/brand-knowledge-base.entity");
const ai_module_1 = require("../ai/ai.module");
const knowledge_module_1 = require("../knowledge/knowledge.module");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.Content, entities_1.ContentAudit, entities_1.PublishRecord, entities_1.MofaStrategy, brand_knowledge_base_entity_1.BrandKnowledgeBase]),
            ai_module_1.AiModule,
            (0, common_1.forwardRef)(() => knowledge_module_1.KnowledgeModule),
        ],
        controllers: [content_controller_1.ContentController],
        providers: [content_service_1.ContentService, content_audit_service_1.ContentAuditService, content_generator_service_1.ContentGeneratorService, knowledge_aware_content_service_1.KnowledgeAwareContentService],
        exports: [content_service_1.ContentService, content_generator_service_1.ContentGeneratorService, knowledge_aware_content_service_1.KnowledgeAwareContentService],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map