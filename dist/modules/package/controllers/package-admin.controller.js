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
exports.PackageAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const package_admin_service_1 = require("../services/package-admin.service");
const package_entity_1 = require("../entities/package.entity");
let PackageAdminController = class PackageAdminController {
    constructor(packageAdminService) {
        this.packageAdminService = packageAdminService;
    }
    async getAllPackages(includeArchived) {
        const packages = await this.packageAdminService.getAllPackages(includeArchived === 'true');
        return {
            success: true,
            data: packages,
            total: packages.length,
        };
    }
    async getStats() {
        return this.packageAdminService.getPackageStats();
    }
    async getPackageById(id) {
        return this.packageAdminService.getPackageById(id);
    }
    async createPackage(dto, req) {
        const pkg = await this.packageAdminService.createPackage(dto, req.user?.id);
        return {
            success: true,
            data: pkg,
            message: '套餐创建成功',
        };
    }
    async updatePackage(id, dto) {
        const pkg = await this.packageAdminService.updatePackage(id, dto);
        return {
            success: true,
            data: pkg,
            message: '套餐更新成功',
        };
    }
    async updateStatus(id, status) {
        const pkg = await this.packageAdminService.updatePackageStatus(id, status);
        return {
            success: true,
            data: pkg,
            message: '状态更新成功',
        };
    }
    async setRecommended(id, recommended) {
        const pkg = await this.packageAdminService.setRecommended(id, recommended);
        return {
            success: true,
            data: pkg,
            message: recommended ? '已设为推荐套餐' : '已取消推荐',
        };
    }
    async reorderPackages(orderedIds) {
        const packages = await this.packageAdminService.reorderPackages(orderedIds);
        return {
            success: true,
            data: packages,
            message: '排序更新成功',
        };
    }
    async duplicatePackage(id, newName) {
        const pkg = await this.packageAdminService.duplicatePackage(id, newName);
        return {
            success: true,
            data: pkg,
            message: '套餐复制成功',
        };
    }
    async deletePackage(id) {
        return this.packageAdminService.deletePackage(id);
    }
    async hardDeletePackage(id) {
        return this.packageAdminService.hardDeletePackage(id);
    }
};
exports.PackageAdminController = PackageAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有套餐列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回套餐列表' }),
    __param(0, (0, common_1.Query)('includeArchived')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "getAllPackages", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取套餐统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '获取套餐详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回套餐详情' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '套餐不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "getPackageById", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '创建套餐' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '套餐创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数错误或套餐名称已存在' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '更新套餐' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '套餐不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '更新套餐状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '状态更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/recommended'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '设置推荐套餐' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '推荐设置成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('recommended')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "setRecommended", null);
__decorate([
    (0, common_1.Put)('reorder'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '重新排序套餐' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '排序更新成功' }),
    __param(0, (0, common_1.Body)('orderedIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "reorderPackages", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '复制套餐' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '套餐复制成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "duplicatePackage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '删除套餐（归档）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐已归档' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '套餐不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "deletePackage", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '永久删除套餐' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐已永久删除' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '套餐不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageAdminController.prototype, "hardDeletePackage", null);
exports.PackageAdminController = PackageAdminController = __decorate([
    (0, swagger_1.ApiTags)('套餐管理 (管理员)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/packages'),
    __metadata("design:paramtypes", [package_admin_service_1.PackageAdminService])
], PackageAdminController);
//# sourceMappingURL=package-admin.controller.js.map