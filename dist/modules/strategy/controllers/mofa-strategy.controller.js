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
exports.MofaStrategyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const mofa_strategy_service_1 = require("../services/mofa-strategy.service");
const mofa_strategy_dto_1 = require("../dto/mofa-strategy.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let MofaStrategyController = class MofaStrategyController {
    constructor(mofaStrategyService) {
        this.mofaStrategyService = mofaStrategyService;
    }
    async generateStrategy(dto) {
        return this.mofaStrategyService.generateStrategy(dto);
    }
    async getStrategyList(query) {
        return this.mofaStrategyService.getStrategyList(query);
    }
    async getStrategyById(id) {
        return this.mofaStrategyService.getStrategyById(id);
    }
    async updateStrategy(id, updates) {
        return this.mofaStrategyService.updateStrategy(id, updates);
    }
    async deleteStrategy(id) {
        const success = await this.mofaStrategyService.deleteStrategy(id);
        return { success, message: success ? '删除成功' : '删除失败' };
    }
    async activateStrategy(id) {
        return this.mofaStrategyService.activateStrategy(id);
    }
    async generateCompetitorStrategy(dto) {
        return this.mofaStrategyService.generateCompetitorStrategy(dto);
    }
    async generateProductStrategy(dto) {
        return this.mofaStrategyService.generateProductStrategy(dto);
    }
    async generateFaqStrategy(dto) {
        return this.mofaStrategyService.generateFaqStrategy(dto);
    }
};
exports.MofaStrategyController = MofaStrategyController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: '生成模豆策略' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '策略生成成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mofa_strategy_dto_1.GenerateMofaStrategyDto]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "generateStrategy", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取策略列表' }),
    (0, swagger_1.ApiQuery)({ name: 'brandId', required: false, description: '品牌ID' }),
    (0, swagger_1.ApiQuery)({ name: 'strategyType', required: false, enum: mofa_strategy_dto_1.StrategyType, description: '策略类型' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '状态' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每页数量' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mofa_strategy_dto_1.QueryMofaStrategyDto]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "getStrategyList", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取策略详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "getStrategyById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新策略' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "updateStrategy", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除策略' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "deleteStrategy", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: '激活策略' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "activateStrategy", null);
__decorate([
    (0, common_1.Post)('generate/competitor'),
    (0, swagger_1.ApiOperation)({ summary: '生成竞品策略' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mofa_strategy_dto_1.GenerateMofaStrategyDto]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "generateCompetitorStrategy", null);
__decorate([
    (0, common_1.Post)('generate/product'),
    (0, swagger_1.ApiOperation)({ summary: '生成产品策略' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mofa_strategy_dto_1.GenerateMofaStrategyDto]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "generateProductStrategy", null);
__decorate([
    (0, common_1.Post)('generate/faq'),
    (0, swagger_1.ApiOperation)({ summary: '生成FAQ策略' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mofa_strategy_dto_1.GenerateMofaStrategyDto]),
    __metadata("design:returntype", Promise)
], MofaStrategyController.prototype, "generateFaqStrategy", null);
exports.MofaStrategyController = MofaStrategyController = __decorate([
    (0, swagger_1.ApiTags)('模豆策略生成'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('strategy/mofa'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mofa_strategy_service_1.MofaStrategyService])
], MofaStrategyController);
//# sourceMappingURL=mofa-strategy.controller.js.map