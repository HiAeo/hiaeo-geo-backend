"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const strategy_controller_1 = require("./controllers/strategy.controller");
const mofa_strategy_controller_1 = require("./controllers/mofa-strategy.controller");
const strategy_service_1 = require("./services/strategy.service");
const mofa_strategy_service_1 = require("./services/mofa-strategy.service");
const knowledge_aware_strategy_service_1 = require("./services/knowledge-aware-strategy.service");
const strategy_entity_1 = require("./entities/strategy.entity");
const brand_knowledge_base_entity_1 = require("../knowledge/entities/brand-knowledge-base.entity");
const diagnosis_module_1 = require("../diagnosis/diagnosis.module");
const ai_module_1 = require("../ai/ai.module");
const knowledge_module_1 = require("../knowledge/knowledge.module");
let StrategyModule = class StrategyModule {
};
exports.StrategyModule = StrategyModule;
exports.StrategyModule = StrategyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([strategy_entity_1.Strategy, brand_knowledge_base_entity_1.BrandKnowledgeBase]),
            diagnosis_module_1.DiagnosisModule,
            ai_module_1.AiModule,
            (0, common_1.forwardRef)(() => knowledge_module_1.KnowledgeModule),
        ],
        controllers: [strategy_controller_1.StrategyController, mofa_strategy_controller_1.MofaStrategyController],
        providers: [strategy_service_1.StrategyService, mofa_strategy_service_1.MofaStrategyService, knowledge_aware_strategy_service_1.KnowledgeAwareStrategyService],
        exports: [strategy_service_1.StrategyService, mofa_strategy_service_1.MofaStrategyService, knowledge_aware_strategy_service_1.KnowledgeAwareStrategyService],
    })
], StrategyModule);
//# sourceMappingURL=strategy.module.js.map