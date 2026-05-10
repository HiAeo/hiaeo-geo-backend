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
var IncrementalDiagnosisTriggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncrementalDiagnosisTriggerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_knowledge_base_entity_1 = require("../entities/brand-knowledge-base.entity");
const diagnosis_task_service_1 = require("../../diagnosis/services/diagnosis-task.service");
const embedding_service_1 = require("./embedding.service");
let IncrementalDiagnosisTriggerService = IncrementalDiagnosisTriggerService_1 = class IncrementalDiagnosisTriggerService {
    constructor(knowledgeRepository, diagnosisTaskService, embeddingService) {
        this.knowledgeRepository = knowledgeRepository;
        this.diagnosisTaskService = diagnosisTaskService;
        this.embeddingService = embeddingService;
        this.logger = new common_1.Logger(IncrementalDiagnosisTriggerService_1.name);
        this.SIGNIFICANCE_THRESHOLD = 0.3;
    }
    async checkAndTrigger(organizationId, changedFields, oldData, newData, userId) {
        const significance = this.calculateChangeSignificance(changedFields, oldData, newData);
        this.logger.log(`知识库变更分析 - org: ${organizationId}, fields: ${changedFields.join(', ')}, significance: ${significance.toFixed(2)}`);
        if (significance < this.SIGNIFICANCE_THRESHOLD) {
            return {
                shouldTrigger: false,
                reason: `变更显著性 (${significance.toFixed(2)}) 低于阈值 (${this.SIGNIFICANCE_THRESHOLD})`,
            };
        }
        const triggerReasons = this.getTriggerReasons(changedFields);
        if (triggerReasons.length === 0) {
            return {
                shouldTrigger: false,
                reason: '变更字段不属于关键诊断维度',
            };
        }
        const task = await this.createIncrementalDiagnosisTask(organizationId, userId, triggerReasons, changedFields);
        return {
            shouldTrigger: true,
            reason: `检测到关键维度变更: ${triggerReasons.join(', ')}`,
            taskId: task.id,
        };
    }
    async manualTrigger(organizationId, userId, dimensions) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            throw new Error('未找到知识库');
        }
        const defaultDimensions = dimensions || [
            'brand_positioning',
            'content_optimization',
            'seo_health',
            'competitor_comparison',
        ];
        const task = await this.diagnosisTaskService.createTask(userId, {
            brandName: knowledge.basicInfo?.companyName || '未命名品牌',
            website: knowledge.basicInfo?.website,
            industry: knowledge.basicInfo?.industry,
            type: 'quick',
            dimensions: defaultDimensions.map(d => ({ dimension: d, enabled: true })),
            includeCompetitorAnalysis: true,
            competitors: knowledge.competitorMarket?.competitors?.map((c) => c.competitorName),
        });
        knowledge.lastDiagnosisRefresh = new Date();
        await this.knowledgeRepository.save(knowledge);
        this.logger.log(`手动触发增量诊断 - taskId: ${task.id}, org: ${organizationId}`);
        return task.id;
    }
    calculateChangeSignificance(changedFields, oldData, newData) {
        const fieldWeights = {
            bizPositioning: 0.4,
            productService: 0.3,
            competitorMarket: 0.2,
            geoGoals: 0.2,
            basicInfo: 0.1,
            supplement: 0.05,
        };
        let totalSignificance = 0;
        for (const field of changedFields) {
            const weight = fieldWeights[field] || 0.1;
            const oldFieldData = oldData?.[field];
            const newFieldData = newData?.[field];
            const fieldChange = this.calculateFieldChange(oldFieldData, newFieldData);
            totalSignificance += weight * fieldChange;
        }
        return Math.min(1, totalSignificance);
    }
    calculateFieldChange(oldData, newData) {
        if (!oldData && !newData)
            return 0;
        if (!oldData || !newData)
            return 1;
        const oldText = JSON.stringify(oldData);
        const newText = JSON.stringify(newData);
        if (oldText === newText)
            return 0;
        const maxLen = Math.max(oldText.length, newText.length);
        const diff = this.levenshteinDistance(oldText, newText);
        return Math.min(1, diff / maxLen);
    }
    levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1)
            .fill(null)
            .map(() => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++)
            dp[i][0] = i;
        for (let j = 0; j <= n; j++)
            dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                }
                else {
                    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
                }
            }
        }
        return dp[m][n];
    }
    getTriggerReasons(changedFields) {
        const reasonMap = {
            bizPositioning: '核心定位变更',
            productService: '产品服务更新',
            competitorMarket: '竞品信息变化',
            geoGoals: '推广目标调整',
        };
        return changedFields
            .filter((field) => reasonMap[field])
            .map((field) => reasonMap[field]);
    }
    async createIncrementalDiagnosisTask(organizationId, userId, triggerReasons, changedFields) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        const dimensions = this.mapFieldsToDimensions(changedFields);
        const task = await this.diagnosisTaskService.createTask(userId, {
            brandName: knowledge?.basicInfo?.companyName || '未命名品牌',
            website: knowledge?.basicInfo?.website,
            industry: knowledge?.basicInfo?.industry,
            type: 'quick',
            dimensions: dimensions.map(d => ({ dimension: d, enabled: true })),
            includeCompetitorAnalysis: changedFields.includes('competitorMarket'),
            competitors: knowledge?.competitorMarket?.competitors?.map((c) => c.competitorName),
        });
        if (knowledge) {
            knowledge.lastDiagnosisRefresh = new Date();
            await this.knowledgeRepository.save(knowledge);
        }
        this.logger.log(`增量诊断任务已创建 - taskId: ${task.id}, reasons: ${triggerReasons.join(', ')}`);
        return task;
    }
    mapFieldsToDimensions(fields) {
        const mapping = {
            bizPositioning: ['brand_positioning', 'content_optimization'],
            productService: ['content_optimization', 'seo_health'],
            competitorMarket: ['competitor_comparison'],
            geoGoals: ['geo_strategy', 'content_optimization'],
            basicInfo: ['brand_positioning'],
            supplement: [],
        };
        const dimensions = new Set();
        for (const field of fields) {
            const mapped = mapping[field] || [];
            mapped.forEach((d) => dimensions.add(d));
        }
        return Array.from(dimensions);
    }
    async shouldSuggestDiagnosis(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return { shouldSuggest: false, reason: '未找到知识库' };
        }
        const completeness = this.calculateCompleteness(knowledge);
        const criticalMissing = completeness.critical < 0.5;
        const daysSinceLastDiagnosis = knowledge.lastDiagnosisRefresh
            ? Math.floor((Date.now() - new Date(knowledge.lastDiagnosisRefresh).getTime()) /
                (1000 * 60 * 60 * 24))
            : 999;
        if (daysSinceLastDiagnosis > 30) {
            return {
                shouldSuggest: true,
                reason: '距离上次诊断已超过30天，建议重新诊断以获取最新建议',
                lastDiagnosisAge: daysSinceLastDiagnosis,
            };
        }
        if (criticalMissing) {
            return {
                shouldSuggest: true,
                reason: `关键信息完整度仅${(completeness.critical * 100).toFixed(0)}%，建议完善后进行诊断`,
                lastDiagnosisAge: daysSinceLastDiagnosis,
            };
        }
        return { shouldSuggest: false };
    }
    calculateCompleteness(knowledge) {
        const fields = [
            { key: 'basicInfo', critical: true },
            { key: 'bizPositioning', critical: true },
            { key: 'productService', critical: true },
            { key: 'competitorMarket', critical: false },
            { key: 'geoGoals', critical: true },
            { key: 'supplement', critical: false },
        ];
        const details = {};
        let criticalFilled = 0;
        let criticalCount = 0;
        let totalFilled = 0;
        let totalCount = fields.length;
        for (const field of fields) {
            const data = knowledge[field.key];
            const filled = this.isFieldFilled(data);
            details[field.key] = filled ? 1 : 0;
            if (filled) {
                totalFilled++;
                if (field.critical) {
                    criticalFilled++;
                }
            }
            if (field.critical) {
                criticalCount++;
            }
        }
        return {
            overall: totalFilled / totalCount,
            critical: criticalCount > 0 ? criticalFilled / criticalCount : 1,
            details,
        };
    }
    isFieldFilled(data) {
        if (!data)
            return false;
        if (typeof data === 'string')
            return data.trim().length > 0;
        if (Array.isArray(data))
            return data.length > 0;
        if (typeof data === 'object')
            return Object.keys(data).length > 0;
        return false;
    }
};
exports.IncrementalDiagnosisTriggerService = IncrementalDiagnosisTriggerService;
exports.IncrementalDiagnosisTriggerService = IncrementalDiagnosisTriggerService = IncrementalDiagnosisTriggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_knowledge_base_entity_1.BrandKnowledgeBase)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        diagnosis_task_service_1.DiagnosisTaskService,
        embedding_service_1.EmbeddingService])
], IncrementalDiagnosisTriggerService);
//# sourceMappingURL=incremental-diagnosis-trigger.service.js.map