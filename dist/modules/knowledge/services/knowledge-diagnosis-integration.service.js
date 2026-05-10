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
var KnowledgeDiagnosisIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeDiagnosisIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_knowledge_base_entity_1 = require("../entities/brand-knowledge-base.entity");
const diagnosis_task_service_1 = require("../../diagnosis/services/diagnosis-task.service");
const diagnosis_report_entity_1 = require("../../diagnosis/entities/diagnosis-report.entity");
let KnowledgeDiagnosisIntegrationService = KnowledgeDiagnosisIntegrationService_1 = class KnowledgeDiagnosisIntegrationService {
    constructor(knowledgeRepository, diagnosisTaskService, reportRepository) {
        this.knowledgeRepository = knowledgeRepository;
        this.diagnosisTaskService = diagnosisTaskService;
        this.reportRepository = reportRepository;
        this.logger = new common_1.Logger(KnowledgeDiagnosisIntegrationService_1.name);
    }
    async updateKnowledgeFromDiagnosis(organizationId, reportId) {
        const report = await this.reportRepository.findOne({
            where: { id: reportId },
        });
        if (!report) {
            this.logger.warn(`诊断报告不存在: ${reportId}`);
            return { updated: false, insights: [] };
        }
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return { updated: false, insights: [] };
        }
        const insights = this.extractInsightsFromReport(report);
        knowledge.lastDiagnosisRefresh = new Date();
        knowledge.lastDiagnosisScore = report.overallScore || 0;
        knowledge.lastDiagnosisGrade = report.grade || 'N';
        knowledge.lastDiagnosisReportId = reportId;
        if (!knowledge.supplement) {
            knowledge.supplement = {};
        }
        knowledge.supplement.lastDiagnosisInsights = insights;
        await this.knowledgeRepository.save(knowledge);
        this.logger.log(`知识库诊断信息已更新 - org: ${organizationId}, score: ${report.overallScore}`);
        return { updated: true, insights };
    }
    extractInsightsFromReport(report) {
        const insights = [];
        if (report.issues && Array.isArray(report.issues)) {
            const criticalIssues = report.issues
                .filter((issue) => issue.severity === 'high' || issue.severity === 'critical')
                .slice(0, 3);
            criticalIssues.forEach((issue) => {
                insights.push(`问题: ${issue.title} - ${issue.description}`);
            });
        }
        if (report.suggestions && Array.isArray(report.suggestions)) {
            report.suggestions
                .slice(0, 3)
                .forEach((suggestion) => {
                insights.push(`建议: ${suggestion.content || suggestion}`);
            });
        }
        if (report.aiInsights && Array.isArray(report.aiInsights)) {
            report.aiInsights
                .slice(0, 2)
                .forEach((insight) => {
                insights.push(`洞察: ${insight}`);
            });
        }
        return insights;
    }
    async getKnowledgeSummaryForDiagnosis(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return null;
        }
        const keyFields = [
            { name: '企业基础信息', status: this.isFieldComplete(knowledge.basicInfo) ? 'complete' : 'incomplete' },
            { name: '核心业务定位', status: this.isFieldComplete(knowledge.bizPositioning) ? 'complete' : 'incomplete' },
            { name: '产品服务详情', status: this.isFieldComplete(knowledge.productService) ? 'complete' : 'incomplete' },
            { name: '竞品市场信息', status: this.isFieldComplete(knowledge.competitorMarket) ? 'complete' : 'incomplete' },
            { name: 'GEO推广目标', status: this.isFieldComplete(knowledge.geoGoals) ? 'complete' : 'incomplete' },
        ];
        const completenessScore = this.calculateCompleteness(knowledge);
        const forbiddenWords = knowledge.supplement?.brandForbiddenWords
            ? knowledge.supplement.brandForbiddenWords.split(/[,，]/).filter(Boolean)
            : undefined;
        return {
            version: knowledge.version,
            lastUpdate: knowledge.updatedAt?.toISOString?.() || String(knowledge.updatedAt),
            completenessScore,
            keyFields,
            forbiddenWords,
        };
    }
    async shouldAutoTriggerDiagnosis(organizationId, changedFields) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return { shouldTrigger: false, reason: '未找到知识库', confidence: 0 };
        }
        const criticalFields = ['bizPositioning', 'productService', 'competitorMarket'];
        const criticalChanged = changedFields.filter((f) => criticalFields.includes(f));
        if (criticalChanged.length === 0) {
            return { shouldTrigger: false, reason: '无关键字段变更', confidence: 0.3 };
        }
        if (knowledge.lastDiagnosisRefresh) {
            const daysSinceLastDiagnosis = Math.floor((Date.now() - new Date(knowledge.lastDiagnosisRefresh).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastDiagnosis < 7) {
                return {
                    shouldTrigger: false,
                    reason: `距离上次诊断仅${daysSinceLastDiagnosis}天，建议稍后再诊断`,
                    confidence: 0.5,
                };
            }
        }
        const significance = this.calculateChangeSignificance(changedFields);
        if (significance < 0.3) {
            return { shouldTrigger: false, reason: '变更幅度较小', confidence: significance };
        }
        return {
            shouldTrigger: true,
            reason: `检测到关键维度变更: ${criticalChanged.join(', ')}`,
            confidence: significance,
        };
    }
    calculateChangeSignificance(fields) {
        const weights = {
            bizPositioning: 0.4,
            productService: 0.3,
            competitorMarket: 0.2,
            geoGoals: 0.15,
            basicInfo: 0.1,
        };
        return fields.reduce((sum, field) => sum + (weights[field] || 0.1), 0);
    }
    isFieldComplete(field) {
        if (!field)
            return false;
        if (typeof field === 'string')
            return field.trim().length > 0;
        if (Array.isArray(field))
            return field.length > 0;
        if (typeof field === 'object')
            return Object.keys(field).length > 0;
        return false;
    }
    calculateCompleteness(knowledge) {
        const sections = [
            { key: 'basicInfo', required: true },
            { key: 'bizPositioning', required: true },
            { key: 'productService', required: true },
            { key: 'competitorMarket', required: false },
            { key: 'geoGoals', required: true },
        ];
        let total = 0;
        let filled = 0;
        for (const section of sections) {
            total++;
            if (this.isFieldComplete(knowledge[section.key])) {
                filled++;
            }
        }
        return total > 0 ? filled / total : 0;
    }
};
exports.KnowledgeDiagnosisIntegrationService = KnowledgeDiagnosisIntegrationService;
exports.KnowledgeDiagnosisIntegrationService = KnowledgeDiagnosisIntegrationService = KnowledgeDiagnosisIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_knowledge_base_entity_1.BrandKnowledgeBase)),
    __param(2, (0, typeorm_1.InjectRepository)(diagnosis_report_entity_1.DiagnosisReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        diagnosis_task_service_1.DiagnosisTaskService,
        typeorm_2.Repository])
], KnowledgeDiagnosisIntegrationService);
//# sourceMappingURL=knowledge-diagnosis-integration.service.js.map