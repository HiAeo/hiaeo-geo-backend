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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("../services/ai.service");
const diagnose_brand_dto_1 = require("../dto/diagnose-brand.dto");
const generate_content_dto_1 = require("../dto/generate-content.dto");
const chat_dto_1 = require("../dto/chat.dto");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async getEngineList() {
        return this.aiService.getEngineList();
    }
    async diagnose(dto, engine) {
        return this.aiService.diagnose(dto, engine);
    }
    async diagnoseBatch(dto) {
        return this.aiService.diagnoseWithAllEngines(dto);
    }
    async generateContent(dto, engine) {
        return this.aiService.generateContent(dto, engine);
    }
    async chat(dto, engine) {
        return this.aiService.chat(dto, engine);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('engines'),
    (0, swagger_1.ApiOperation)({ summary: '获取AI引擎列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回可用AI引擎列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getEngineList", null);
__decorate([
    (0, common_1.Post)('diagnose'),
    (0, swagger_1.ApiOperation)({ summary: '品牌GEO诊断' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, description: '指定引擎类型' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回诊断结果' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [diagnose_brand_dto_1.DiagnoseBrandDto, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "diagnose", null);
__decorate([
    (0, common_1.Post)('diagnose/batch'),
    (0, swagger_1.ApiOperation)({ summary: '多引擎批量诊断' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回多引擎诊断结果' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [diagnose_brand_dto_1.DiagnoseBrandDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "diagnoseBatch", null);
__decorate([
    (0, common_1.Post)('content/generate'),
    (0, swagger_1.ApiOperation)({ summary: '生成SEO内容' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, description: '指定引擎类型' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回生成的内容' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_content_dto_1.GenerateContentDto, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateContent", null);
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'AI聊天对话' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, description: '指定引擎类型' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回AI回复' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.ChatDto, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI引擎'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map