"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticService = void 0;
const common_1 = require("@nestjs/common");
const semantic_entity_service_1 = require("./semantic-entity.service");
const template_service_1 = require("./template.service");
const style_adapter_service_1 = require("./style-adapter.service");
let SemanticService = class SemanticService {
    constructor(entityService, templateService, styleService) {
        this.entityService = entityService;
        this.templateService = templateService;
        this.styleService = styleService;
    }
    async analyze(text) {
        return {
            entities: [],
            keywords: [],
            sentiment: 'neutral',
        };
    }
    async getLibrary() {
        return {
            entities: [],
            templates: [],
        };
    }
    async generateFromTemplate(templateId, variables) {
        return this.templateService.applyTemplate(templateId, variables);
    }
};
exports.SemanticService = SemanticService;
exports.SemanticService = SemanticService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [semantic_entity_service_1.SemanticEntityService,
        template_service_1.TemplateService,
        style_adapter_service_1.StyleAdapterService])
], SemanticService);
//# sourceMappingURL=semantic.service.js.map