"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyService = void 0;
const common_1 = require("@nestjs/common");
let StrategyService = class StrategyService {
    constructor() {
        this.strategies = [];
    }
    async getList(filters) {
        let result = [...this.strategies];
        if (filters.brandId) {
            result = result.filter(s => s.brandId === filters.brandId);
        }
        if (filters.status) {
            result = result.filter(s => s.status === filters.status);
        }
        return { list: result, total: result.length };
    }
    async getById(id) {
        return this.strategies.find(s => s.id === id) || null;
    }
    async generate(dto) {
        const strategy = {
            id: `str_${Date.now()}`,
            brandId: dto.brandId || '',
            name: dto.name || '新策略',
            type: dto.type || 'content',
            content: this.generateStrategyContent(dto),
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.strategies.push(strategy);
        return strategy;
    }
    generateStrategyContent(dto) {
        return JSON.stringify({
            keywords: dto.keywords || [],
            channels: dto.channels || ['search', 'social'],
            contentTypes: dto.contentTypes || ['article', 'video'],
            timeline: {
                phase1: { duration: '1-2周', tasks: ['关键词研究', '竞品分析'] },
                phase2: { duration: '3-4周', tasks: ['内容创作', '平台适配'] },
                phase3: { duration: '持续', tasks: ['效果监测', '优化迭代'] }
            },
            recommendations: [
                '聚焦长尾关键词，覆盖用户搜索意图',
                '多渠道分发内容，提升品牌曝光',
                '定期分析数据，调整优化策略'
            ]
        }, null, 2);
    }
    async update(id, data) {
        const index = this.strategies.findIndex(s => s.id === id);
        if (index === -1)
            return null;
        this.strategies[index] = {
            ...this.strategies[index],
            ...data,
            updatedAt: new Date()
        };
        return this.strategies[index];
    }
    async delete(id) {
        const index = this.strategies.findIndex(s => s.id === id);
        if (index === -1)
            return false;
        this.strategies.splice(index, 1);
        return true;
    }
    async execute(id) {
        const strategy = await this.getById(id);
        if (!strategy) {
            return { success: false, message: '策略不存在' };
        }
        strategy.status = 'active';
        strategy.updatedAt = new Date();
        return {
            success: true,
            message: '策略执行中...',
            executionId: `exe_${Date.now()}`
        };
    }
};
exports.StrategyService = StrategyService;
exports.StrategyService = StrategyService = __decorate([
    (0, common_1.Injectable)()
], StrategyService);
//# sourceMappingURL=strategy.service.js.map