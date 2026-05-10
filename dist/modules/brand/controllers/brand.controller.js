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
exports.BrandController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const brand_service_1 = require("../services/brand.service");
const brand_dto_1 = require("../dto/brand.dto");
let BrandController = class BrandController {
    constructor(brandService) {
        this.brandService = brandService;
    }
    async getList(query, req) {
        return this.brandService.getList(query, req.user.id, req.user.organizationId);
    }
    async getStats(req) {
        return this.brandService.getStats(req.user.organizationId);
    }
    async getMyBrands(req) {
        return this.brandService.getByUser(req.user.id);
    }
    async getById(id, req) {
        return this.brandService.getById(id, req.user.organizationId);
    }
    async getSeoData(id, req) {
        return this.brandService.getSeoData(id, req.user.organizationId);
    }
    async updateSeoData(id, seoData, req) {
        return this.brandService.updateSeoData(id, seoData, req.user.organizationId);
    }
    async getSocialMedia(id, req) {
        return this.brandService.getSocialMedia(id, req.user.organizationId);
    }
    async updateSocialMedia(id, body, req) {
        return this.brandService.updateSocialMedia(id, body, req.user.organizationId);
    }
    async create(dto, req) {
        return this.brandService.create(dto, req.user.id, req.user.organizationId);
    }
    async update(id, dto, req) {
        return this.brandService.update(id, dto, req.user.organizationId);
    }
    async delete(id, req) {
        return this.brandService.delete(id, req.user.organizationId);
    }
    async hardDelete(id, req) {
        return this.brandService.hardDelete(id, req.user.organizationId);
    }
};
exports.BrandController = BrandController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取品牌列表（支持分页筛选）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回品牌列表' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [brand_dto_1.BrandQueryDto, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取品牌统计信息' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的品牌' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getMyBrands", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取品牌详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回品牌详情' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '品牌不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/seo'),
    (0, swagger_1.ApiOperation)({ summary: '获取品牌SEO数据' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getSeoData", null);
__decorate([
    (0, common_1.Put)(':id/seo'),
    (0, swagger_1.ApiOperation)({ summary: '更新品牌SEO数据' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('seoData')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "updateSeoData", null);
__decorate([
    (0, common_1.Get)(':id/social'),
    (0, swagger_1.ApiOperation)({ summary: '获取品牌社交媒体配置' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getSocialMedia", null);
__decorate([
    (0, common_1.Put)(':id/social'),
    (0, swagger_1.ApiOperation)({ summary: '更新品牌社交媒体配置' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "updateSocialMedia", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建品牌' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '品牌创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数错误或品牌数量已达上限' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [brand_dto_1.CreateBrandDto, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新品牌' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '品牌更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '品牌不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, brand_dto_1.UpdateBrandDto, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '删除品牌（软删除）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '品牌删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '品牌不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '永久删除品牌（仅管理员）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '品牌永久删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "hardDelete", null);
exports.BrandController = BrandController = __decorate([
    (0, swagger_1.ApiTags)('品牌管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('brand'),
    __metadata("design:paramtypes", [brand_service_1.BrandService])
], BrandController);
//# sourceMappingURL=brand.controller.js.map