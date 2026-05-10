"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const brand_knowledge_base_entity_1 = require("./entities/brand-knowledge-base.entity");
const diagnosis_report_entity_1 = require("../diagnosis/entities/diagnosis-report.entity");
const knowledge_service_1 = require("./services/knowledge.service");
const knowledge_controller_1 = require("./controllers/knowledge.controller");
const vector_controller_1 = require("./controllers/vector.controller");
const embedding_service_1 = require("./services/embedding.service");
const enhanced_ai_suggestion_service_1 = require("./services/enhanced-ai-suggestion.service");
const incremental_diagnosis_trigger_service_1 = require("./services/incremental-diagnosis-trigger.service");
const vector_storage_service_1 = require("./services/vector-storage.service");
const knowledge_diagnosis_integration_service_1 = require("./services/knowledge-diagnosis-integration.service");
const vector_health_service_1 = require("../../services/vector-health.service");
const ai_module_1 = require("../ai/ai.module");
const diagnosis_module_1 = require("../diagnosis/diagnosis.module");
const auth_module_1 = require("../auth/auth.module");
let KnowledgeModule = class KnowledgeModule {
};
exports.KnowledgeModule = KnowledgeModule;
exports.KnowledgeModule = KnowledgeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([brand_knowledge_base_entity_1.BrandKnowledgeBase, diagnosis_report_entity_1.DiagnosisReport]),
            platform_express_1.MulterModule.register({
                dest: './uploads/knowledge',
            }),
            (0, common_1.forwardRef)(() => ai_module_1.AiModule),
            (0, common_1.forwardRef)(() => diagnosis_module_1.DiagnosisModule),
            auth_module_1.AuthModule,
        ],
        controllers: [knowledge_controller_1.KnowledgeController, vector_controller_1.VectorController],
        providers: [
            knowledge_service_1.KnowledgeService,
            embedding_service_1.EmbeddingService,
            enhanced_ai_suggestion_service_1.EnhancedAiSuggestionService,
            incremental_diagnosis_trigger_service_1.IncrementalDiagnosisTriggerService,
            vector_storage_service_1.VectorStorageService,
            knowledge_diagnosis_integration_service_1.KnowledgeDiagnosisIntegrationService,
            vector_health_service_1.VectorHealthService,
        ],
        exports: [knowledge_service_1.KnowledgeService, vector_storage_service_1.VectorStorageService, knowledge_diagnosis_integration_service_1.KnowledgeDiagnosisIntegrationService, vector_health_service_1.VectorHealthService],
    })
], KnowledgeModule);
//# sourceMappingURL=knowledge.module.js.map