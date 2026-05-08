"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const semantic_controller_1 = require("./controllers/semantic.controller");
const semantic_service_1 = require("./services/semantic.service");
const semantic_entity_service_1 = require("./services/semantic-entity.service");
const template_service_1 = require("./services/template.service");
const style_adapter_service_1 = require("./services/style-adapter.service");
const semantic_entity_entity_1 = require("./entities/semantic-entity.entity");
const content_template_entity_1 = require("./entities/content-template.entity");
let SemanticModule = class SemanticModule {
};
exports.SemanticModule = SemanticModule;
exports.SemanticModule = SemanticModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([semantic_entity_entity_1.SemanticEntity, content_template_entity_1.ContentTemplate])],
        controllers: [semantic_controller_1.SemanticController],
        providers: [semantic_service_1.SemanticService, semantic_entity_service_1.SemanticEntityService, template_service_1.TemplateService, style_adapter_service_1.StyleAdapterService],
        exports: [semantic_service_1.SemanticService]
    })
], SemanticModule);
//# sourceMappingURL=semantic.module.js.map