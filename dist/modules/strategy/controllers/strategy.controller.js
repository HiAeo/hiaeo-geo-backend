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
exports.StrategyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const strategy_service_1 = require("../services/strategy.service");
let StrategyController = class StrategyController {
    constructor(strategyService) {
        this.strategyService = strategyService;
    }
    async getList(brandId, status) {
        return this.strategyService.getList({ brandId, status });
    }
    async getById(id) {
        return this.strategyService.getById(id);
    }
    async generate(data) {
        return this.strategyService.generate(data);
    }
    async update(id, data) {
        return this.strategyService.update(id, data);
    }
    async delete(id) {
        return this.strategyService.delete(id);
    }
    async execute(id) {
        return this.strategyService.execute(id);
    }
};
exports.StrategyController = StrategyController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取策略列表' }),
    (0, swagger_1.ApiQuery)({ name: 'brandId', required: false, description: '品牌ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '策略状态' }),
    __param(0, (0, common_1.Query)('brandId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取策略详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: '生成策略' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "generate", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新策略' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除策略' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, swagger_1.ApiOperation)({ summary: '执行策略' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "execute", null);
exports.StrategyController = StrategyController = __decorate([
    (0, swagger_1.ApiTags)('策略管理'),
    (0, common_1.Controller)('strategy'),
    __metadata("design:paramtypes", [strategy_service_1.StrategyService])
], StrategyController);
//# sourceMappingURL=strategy.controller.js.map