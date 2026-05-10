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
exports.PublishController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const publish_service_1 = require("../services/publish.service");
const publish_dto_1 = require("../dto/publish.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let PublishController = class PublishController {
    constructor(publishService) {
        this.publishService = publishService;
    }
    async publishContent(dto) {
        return this.publishService.publishContent(dto);
    }
    async batchPublish(dto) {
        return this.publishService.batchPublish(dto);
    }
    async getPublishList(query) {
        return this.publishService.getPublishList(query);
    }
    async getPublishById(id) {
        return this.publishService.getPublishById(id);
    }
    async cancelPublish(id) {
        return this.publishService.cancelPublish(id);
    }
    async retryPublish(id) {
        return this.publishService.retryPublish(id);
    }
    async copyContent(contentId) {
        return this.publishService.copyContent(contentId);
    }
    async exportContent(dto) {
        return this.publishService.exportContent(dto);
    }
    async getPlatformStatus() {
        return this.publishService.getPlatformStatus();
    }
};
exports.PublishController = PublishController;
__decorate([
    (0, common_1.Post)('content'),
    (0, swagger_1.ApiOperation)({ summary: '发布内容到多平台' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '发布成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_dto_1.PublishContentDto]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "publishContent", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: '批量发布内容' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '批量发布完成' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_dto_1.BatchPublishDto]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "batchPublish", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: '获取发布记录列表' }),
    (0, swagger_1.ApiQuery)({ name: 'brandId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'contentType', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'platform', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_dto_1.QueryPublishDto]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "getPublishList", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取发布记录详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "getPublishById", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消发布' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "cancelPublish", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, swagger_1.ApiOperation)({ summary: '重新发布' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "retryPublish", null);
__decorate([
    (0, common_1.Post)('copy/:contentId'),
    (0, swagger_1.ApiOperation)({ summary: '复制内容到剪贴板' }),
    __param(0, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "copyContent", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, swagger_1.ApiOperation)({ summary: '导出内容' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_dto_1.ExportContentDto]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "exportContent", null);
__decorate([
    (0, common_1.Get)('platforms/status'),
    (0, swagger_1.ApiOperation)({ summary: '获取平台状态' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "getPlatformStatus", null);
exports.PublishController = PublishController = __decorate([
    (0, swagger_1.ApiTags)('内容发布'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('publish'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [publish_service_1.PublishService])
], PublishController);
//# sourceMappingURL=publish.controller.js.map