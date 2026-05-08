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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const content_service_1 = require("../services/content.service");
const content_audit_service_1 = require("../services/content-audit.service");
const create_content_dto_1 = require("../dto/create-content.dto");
const query_content_dto_1 = require("../dto/query-content.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let ContentController = class ContentController {
    constructor(contentService, auditService) {
        this.contentService = contentService;
        this.auditService = auditService;
    }
    async create(createContentDto, req) {
        const content = await this.contentService.create(createContentDto, req.user?.id || 'system');
        await this.auditService.logAction(content.id, req.user?.id || 'system', 'create');
        return content;
    }
    async findAll(query) {
        return this.contentService.findAll(query);
    }
    async findOne(id) {
        return this.contentService.findOne(id);
    }
    async update(id, updateData, req) {
        const content = await this.contentService.update(id, updateData);
        await this.auditService.logAction(id, req.user?.id || 'system', 'update', updateData);
        return content;
    }
    async remove(id, req) {
        await this.contentService.remove(id);
        await this.auditService.logAction(id, req.user?.id || 'system', 'delete');
        return { message: '删除成功' };
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建内容' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_content_dto_1.CreateContentDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '查询内容列表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_content_dto_1.QueryContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取内容详情' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新内容' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除内容' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "remove", null);
exports.ContentController = ContentController = __decorate([
    (0, swagger_1.ApiTags)('内容管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('content'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [content_service_1.ContentService,
        content_audit_service_1.ContentAuditService])
], ContentController);
//# sourceMappingURL=content.controller.js.map