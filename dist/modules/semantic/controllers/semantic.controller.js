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
exports.SemanticController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const semantic_service_1 = require("../services/semantic.service");
let SemanticController = class SemanticController {
    constructor(semanticService) {
        this.semanticService = semanticService;
    }
    async getLibrary() {
        return this.semanticService.getLibrary();
    }
    async analyze(data) {
        return this.semanticService.analyze(data);
    }
};
exports.SemanticController = SemanticController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取语义库' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SemanticController.prototype, "getLibrary", null);
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: '分析语义' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SemanticController.prototype, "analyze", null);
exports.SemanticController = SemanticController = __decorate([
    (0, swagger_1.ApiTags)('语义分析'),
    (0, common_1.Controller)('semantic'),
    __metadata("design:paramtypes", [semantic_service_1.SemanticService])
], SemanticController);
//# sourceMappingURL=semantic.controller.js.map