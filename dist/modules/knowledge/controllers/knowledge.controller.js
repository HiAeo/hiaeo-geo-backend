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
exports.KnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../auth/guards/permission.guard");
const permission_decorator_1 = require("../../auth/decorators/permission.decorator");
const knowledge_service_1 = require("../services/knowledge.service");
const enhanced_ai_suggestion_service_1 = require("../services/enhanced-ai-suggestion.service");
const incremental_diagnosis_trigger_service_1 = require("../services/incremental-diagnosis-trigger.service");
const vector_storage_service_1 = require("../services/vector-storage.service");
const knowledge_dto_1 = require("../dto/knowledge.dto");
const permissions_constant_1 = require("../../auth/constants/permissions.constant");
let KnowledgeController = class KnowledgeController {
    constructor(knowledgeService, aiSuggestionService, diagnosisTriggerService, vectorStorageService) {
        this.knowledgeService = knowledgeService;
        this.aiSuggestionService = aiSuggestionService;
        this.diagnosisTriggerService = diagnosisTriggerService;
        this.vectorStorageService = vectorStorageService;
    }
    async getProfile(req) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { data: null };
        }
        const knowledge = await this.knowledgeService.getKnowledgeBase(organizationId);
        return { data: knowledge };
    }
    async createProfile(req, dto) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { success: false, message: '未找到组织信息' };
        }
        const knowledge = await this.knowledgeService.createKnowledgeBase(organizationId, dto);
        return { success: true, data: knowledge };
    }
    async updateProfile(req, dto) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { success: false, message: '未找到组织信息' };
        }
        const knowledge = await this.knowledgeService.updateKnowledgeBase(organizationId, dto);
        return {
            success: true,
            data: {
                version: knowledge.version,
                updatedAt: knowledge.updatedAt,
            },
        };
    }
    async uploadFile(req, file, module) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { success: false, message: '未找到组织信息' };
        }
        if (!file) {
            return { success: false, message: '请上传文件' };
        }
        const result = await this.knowledgeService.uploadFile(organizationId, module || 'default', file);
        return { success: true, data: result };
    }
    async deleteFile(req, fileId) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { success: false, message: '未找到组织信息' };
        }
        const deleted = await this.knowledgeService.deleteFile(organizationId, fileId);
        return { success: deleted };
    }
    async getHistory(req, page = '1', size = '10') {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { data: { list: [], total: 0 } };
        }
        const result = await this.knowledgeService.getVersionHistory(organizationId, parseInt(page, 10), parseInt(size, 10));
        return { data: result };
    }
    async getAiSuggestion(dto) {
        const result = await this.knowledgeService.getAiSuggestion(dto.field, dto.sourceUrl || dto.sourceText);
        return { data: result };
    }
    async getEnhancedFieldSuggestion(req, dto) {
        const organizationId = req.user?.organizationId;
        const result = await this.aiSuggestionService.getFieldSuggestion(organizationId, dto.field);
        return { data: result };
    }
    async extractFromUrl(req, dto) {
        const organizationId = req.user?.organizationId;
        const result = await this.aiSuggestionService.extractFromUrl(organizationId, dto.url, dto.targetField);
        return { data: result };
    }
    async extractFromText(req, dto) {
        const organizationId = req.user?.organizationId;
        const result = await this.aiSuggestionService.extractFromText(organizationId, dto.text, dto.targetFields);
        return { data: result };
    }
    async getCompletenessReport(req) {
        const organizationId = req.user?.organizationId;
        const result = await this.aiSuggestionService.generateCompletenessReport(organizationId);
        return { data: result };
    }
    async getKeywordSuggestions(req) {
        const organizationId = req.user?.organizationId;
        const result = await this.aiSuggestionService.suggestKeywords(organizationId);
        return { data: result };
    }
    async getDiagnosisSuggestion(req) {
        const organizationId = req.user?.organizationId;
        const result = await this.diagnosisTriggerService.shouldSuggestDiagnosis(organizationId);
        return { data: result };
    }
    async triggerIncrementalDiagnosis(req, dto) {
        const organizationId = req.user?.organizationId;
        const userId = req.user?.id;
        const taskId = await this.diagnosisTriggerService.manualTrigger(organizationId, userId, dto.dimensions);
        return { success: true, taskId };
    }
    async semanticSearch(req, dto) {
        const organizationId = req.user?.organizationId;
        const result = await this.vectorStorageService.semanticSearch(organizationId, dto.query, dto.topK || 5);
        return { data: result };
    }
    async rebuildIndex(req) {
        const organizationId = req.user?.organizationId;
        const result = await this.vectorStorageService.indexKnowledgeBase(organizationId);
        return { success: true, ...result };
    }
    async getIndexStatus(req) {
        const organizationId = req.user?.organizationId;
        const result = await this.vectorStorageService.getIndexStatus(organizationId);
        return { data: result };
    }
    async findSimilarKnowledgeBases(req, topK = '5') {
        const organizationId = req.user?.organizationId;
        const result = await this.vectorStorageService.findSimilarKnowledgeBases(organizationId, parseInt(topK, 10));
        return { data: result };
    }
};
exports.KnowledgeController = KnowledgeController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.KNOWLEDGE_WRITE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.CreateKnowledgeBaseDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.KNOWLEDGE_WRITE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.UpdateKnowledgeBaseDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.KNOWLEDGE_WRITE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 50 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Delete)('file/:fileId'),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permissions_constant_1.PERMISSIONS.KNOWLEDGE_DELETE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('ai-suggest'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [knowledge_dto_1.AiSuggestDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getAiSuggestion", null);
__decorate([
    (0, common_1.Post)('ai-suggest/field'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.EnhancedFieldSuggestionDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getEnhancedFieldSuggestion", null);
__decorate([
    (0, common_1.Post)('ai-extract/url'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.ExtractFromUrlDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "extractFromUrl", null);
__decorate([
    (0, common_1.Post)('ai-extract/text'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.ExtractFromTextDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "extractFromText", null);
__decorate([
    (0, common_1.Get)('completeness'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getCompletenessReport", null);
__decorate([
    (0, common_1.Get)('keywords'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getKeywordSuggestions", null);
__decorate([
    (0, common_1.Get)('diagnosis-suggest'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getDiagnosisSuggestion", null);
__decorate([
    (0, common_1.Post)('diagnosis-trigger'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.ManualTriggerDiagnosisDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "triggerIncrementalDiagnosis", null);
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.SemanticSearchDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "semanticSearch", null);
__decorate([
    (0, common_1.Post)('index'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "rebuildIndex", null);
__decorate([
    (0, common_1.Get)('index'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getIndexStatus", null);
__decorate([
    (0, common_1.Get)('similar'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('topK')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "findSimilarKnowledgeBases", null);
exports.KnowledgeController = KnowledgeController = __decorate([
    (0, common_1.Controller)('v1/knowledge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [knowledge_service_1.KnowledgeService,
        enhanced_ai_suggestion_service_1.EnhancedAiSuggestionService,
        incremental_diagnosis_trigger_service_1.IncrementalDiagnosisTriggerService,
        vector_storage_service_1.VectorStorageService])
], KnowledgeController);
//# sourceMappingURL=knowledge.controller.js.map