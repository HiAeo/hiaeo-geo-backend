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
exports.HubController = void 0;
const common_1 = require("@nestjs/common");
const hub_service_1 = require("../services/hub.service");
const swagger_1 = require("@nestjs/swagger");
let HubController = class HubController {
    constructor(hubService) {
        this.hubService = hubService;
    }
    async getStats(brandId) {
        return this.hubService.getStats(brandId);
    }
    async getBossView(brandId) {
        return this.hubService.getBossView(brandId);
    }
    async getOpsView(brandId) {
        return this.hubService.getOpsView(brandId);
    }
    async getTechView(brandId) {
        return this.hubService.getTechView(brandId);
    }
    async getBrandRanking() {
        return this.hubService.getBrandRanking();
    }
    async getVisibilityTrend(period = '30d') {
        return this.hubService.getVisibilityTrend(period);
    }
    async getPendingTasks(brandId) {
        return this.hubService.getPendingTasks(brandId);
    }
    async getSuggestions(brandId) {
        return this.hubService.getSuggestions(brandId);
    }
};
exports.HubController = HubController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取Hub统计数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '统计数据' }),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('boss-view'),
    (0, swagger_1.ApiOperation)({ summary: '老板视图数据' }),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getBossView", null);
__decorate([
    (0, common_1.Get)('ops-view'),
    (0, swagger_1.ApiOperation)({ summary: '运营视图数据' }),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getOpsView", null);
__decorate([
    (0, common_1.Get)('tech-view'),
    (0, swagger_1.ApiOperation)({ summary: '技术视图数据' }),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getTechView", null);
__decorate([
    (0, common_1.Get)('brand-ranking'),
    (0, swagger_1.ApiOperation)({ summary: '品牌排名数据' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getBrandRanking", null);
__decorate([
    (0, common_1.Get)('visibility-trend'),
    (0, swagger_1.ApiOperation)({ summary: '可见度趋势数据' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getVisibilityTrend", null);
__decorate([
    (0, common_1.Get)('pending-tasks'),
    (0, swagger_1.ApiOperation)({ summary: '待处理任务列表' }),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getPendingTasks", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    (0, swagger_1.ApiOperation)({ summary: '运营建议列表' }),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getSuggestions", null);
exports.HubController = HubController = __decorate([
    (0, swagger_1.ApiTags)('Hub管理驾驶舱'),
    (0, common_1.Controller)('hub'),
    __metadata("design:paramtypes", [hub_service_1.HubService])
], HubController);
//# sourceMappingURL=hub.controller.js.map