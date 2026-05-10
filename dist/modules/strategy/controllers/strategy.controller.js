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
const mofa_strategy_service_1 = require("../services/mofa-strategy.service");
const knowledge_aware_strategy_service_1 = require("../services/knowledge-aware-strategy.service");
const strategy_dto_1 = require("../dto/strategy.dto");
const mofa_strategy_dto_1 = require("../dto/mofa-strategy.dto");
let StrategyController = class StrategyController {
    constructor(strategyService, mofaStrategyService, knowledgeAwareStrategyService) {
        this.strategyService = strategyService;
        this.mofaStrategyService = mofaStrategyService;
        this.knowledgeAwareStrategyService = knowledgeAwareStrategyService;
    }
    async generateFromKnowledge(req, body) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { success: false, message: '未找到组织信息' };
        }
        const strategyType = body.strategyType || mofa_strategy_dto_1.StrategyType.CONTENT;
        const result = await this.knowledgeAwareStrategyService.generateStrategyFromKnowledge(organizationId, strategyType);
        if (!result.success || !result.data) {
            return { success: false, message: result.error || '无法获取知识库数据' };
        }
        const strategy = await this.mofaStrategyService.generateStrategy(result.data);
        return {
            success: true,
            data: strategy,
            context: {
                brandName: result.data.brandName,
                keywords: result.data.keywords,
            },
            message: '基于知识库的策略生成成功',
        };
    }
    async getKnowledgeContext(req) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { success: false, message: '未找到组织信息' };
        }
        const context = await this.knowledgeAwareStrategyService.getKnowledgeContextForStrategy(organizationId);
        if (!context) {
            return { success: false, message: '未找到知识库' };
        }
        return { success: true, data: context };
    }
    async validateConsistency(req, body) {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            return { success: false, message: '未找到组织信息' };
        }
        const result = await this.knowledgeAwareStrategyService.validateStrategyConsistency(organizationId, body.strategy);
        return { success: true, ...result };
    }
    async generateFromReport(userId, dto) {
        dto.userId = userId;
        const strategy = await this.strategyService.generateFromDiagnosisReport(dto);
        return {
            success: true,
            data: strategy,
            message: '基于诊断报告的策略生成成功',
        };
    }
    async generate(userId, data) {
        data.userId = userId;
        const strategy = await this.strategyService.generate(data);
        return {
            success: true,
            data: strategy,
            message: '策略生成成功',
        };
    }
    async getList(userId, brandId, status) {
        const result = await this.strategyService.getList({ brandId, status, userId });
        return {
            success: true,
            data: result,
        };
    }
    async getById(userId, id) {
        const strategy = await this.strategyService.getById(id);
        if (!strategy) {
            return { success: false, message: '策略不存在' };
        }
        return {
            success: true,
            data: strategy,
        };
    }
    async create(userId, dto) {
        dto.userId = userId;
        const strategy = await this.strategyService.create(dto);
        return {
            success: true,
            data: strategy,
            message: '策略创建成功',
        };
    }
    async update(id, dto) {
        const strategy = await this.strategyService.update(id, dto);
        if (!strategy) {
            return { success: false, message: '策略不存在' };
        }
        return {
            success: true,
            data: strategy,
            message: '策略更新成功',
        };
    }
    async delete(id) {
        const success = await this.strategyService.delete(id);
        return {
            success,
            message: success ? '策略删除成功' : '策略不存在',
        };
    }
    async execute(id) {
        const result = await this.strategyService.execute(id);
        return {
            success: result.success,
            data: { executionId: result.executionId },
            message: result.message,
        };
    }
};
exports.StrategyController = StrategyController;
__decorate([
    (0, common_1.Post)('from-knowledge'),
    (0, swagger_1.ApiOperation)({ summary: '基于知识库生成策略' }),
    (0, swagger_1.ApiHeader)({ name: 'Authorization', description: '用户Token', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "generateFromKnowledge", null);
__decorate([
    (0, common_1.Get)('knowledge-context'),
    (0, swagger_1.ApiOperation)({ summary: '获取知识库上下文用于策略生成' }),
    (0, swagger_1.ApiHeader)({ name: 'Authorization', description: '用户Token', required: false }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "getKnowledgeContext", null);
__decorate([
    (0, common_1.Post)('validate-consistency'),
    (0, swagger_1.ApiOperation)({ summary: '验证策略与知识库的一致性' }),
    (0, swagger_1.ApiHeader)({ name: 'Authorization', description: '用户Token', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "validateConsistency", null);
__decorate([
    (0, common_1.Post)('generate-from-report'),
    (0, swagger_1.ApiOperation)({ summary: '基于诊断报告生成策略' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: false }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '策略生成成功' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, strategy_dto_1.GenerateStrategyFromReportDto]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "generateFromReport", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: '生成策略' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: false }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取策略列表' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'brandId', required: false, description: '品牌ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '策略状态' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Query)('brandId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取策略详情' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: false }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建策略' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: '用户ID', required: false }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, strategy_dto_1.CreateStrategyDto]),
    __metadata("design:returntype", Promise)
], StrategyController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新策略' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, strategy_dto_1.UpdateStrategyDto]),
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
    __metadata("design:paramtypes", [strategy_service_1.StrategyService,
        mofa_strategy_service_1.MofaStrategyService,
        knowledge_aware_strategy_service_1.KnowledgeAwareStrategyService])
], StrategyController);
//# sourceMappingURL=strategy.controller.js.map