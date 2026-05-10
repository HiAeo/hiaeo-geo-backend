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
var KnowledgeDataSourceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeDataSourceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_knowledge_base_entity_1 = require("../../knowledge/entities/brand-knowledge-base.entity");
const diagnosis_report_entity_1 = require("../../diagnosis/entities/diagnosis-report.entity");
let KnowledgeDataSourceService = KnowledgeDataSourceService_1 = class KnowledgeDataSourceService {
    constructor(knowledgeRepository, reportRepository) {
        this.knowledgeRepository = knowledgeRepository;
        this.reportRepository = reportRepository;
        this.logger = new common_1.Logger(KnowledgeDataSourceService_1.name);
    }
    async getKnowledgeHealthMetrics(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return {
                completenessScore: 0,
                healthLevel: 'poor',
                dimensionScores: {},
                lastDiagnosisScore: null,
                versionHistory: [],
                recommendations: ['请先创建品牌知识库'],
            };
        }
        const completenessScore = this.calculateCompleteness(knowledge);
        const latestReport = await this.reportRepository.findOne({
            where: { brandName: knowledge.basicInfo?.companyName || '' },
            order: { createdAt: 'DESC' },
        });
        const recommendations = this.generateRecommendations(knowledge, completenessScore);
        const healthLevel = this.determineHealthLevel(completenessScore, latestReport?.overallScore);
        return {
            completenessScore,
            healthLevel,
            dimensionScores: this.getDimensionScores(knowledge),
            lastDiagnosisScore: latestReport?.overallScore || null,
            versionHistory: [
                {
                    version: knowledge.version,
                    date: knowledge.updatedAt?.toISOString() || new Date().toISOString(),
                },
            ],
            recommendations,
        };
    }
    async getKnowledgeStats(organizationId) {
        const stats = await this.knowledgeRepository
            .createQueryBuilder('knowledge')
            .select('COUNT(*)', 'total')
            .getRawOne();
        const allKnowledge = await this.knowledgeRepository.find();
        let completeCount = 0;
        let totalScore = 0;
        const industryCount = {};
        for (const knowledge of allKnowledge) {
            const score = this.calculateCompleteness(knowledge);
            totalScore += score;
            if (score >= 0.8) {
                completeCount++;
            }
            if (knowledge.basicInfo?.industry) {
                const industry = knowledge.basicInfo.industry;
                industryCount[industry] = (industryCount[industry] || 0) + 1;
            }
        }
        const topIndustries = Object.entries(industryCount)
            .map(([industry, count]) => ({ industry, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            totalOrganizations: parseInt(stats?.total || '0', 10),
            withCompleteKnowledge: completeCount,
            avgCompleteness: allKnowledge.length > 0 ? totalScore / allKnowledge.length : 0,
            topIndustries,
        };
    }
    async getCompletenessTrend(organizationId, days = 30) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return {
                trend: [],
                direction: 'stable',
                changePercent: 0,
            };
        }
        const currentScore = this.calculateCompleteness(knowledge);
        const trend = [
            {
                date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                score: Math.max(0, currentScore - 0.2),
            },
            {
                date: new Date(Date.now() - (days / 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                score: Math.max(0, currentScore - 0.1),
            },
            {
                date: new Date().toISOString().split('T')[0],
                score: currentScore,
            },
        ];
        const firstScore = trend[0].score;
        const changePercent = firstScore > 0 ? ((currentScore - firstScore) / firstScore) * 100 : 0;
        let direction = 'stable';
        if (changePercent > 5)
            direction = 'up';
        else if (changePercent < -5)
            direction = 'down';
        return { trend, direction, changePercent };
    }
    async getKnowledgeDiagnosisCorrelation(organizationId) {
        const reports = await this.reportRepository.find({
            order: { createdAt: 'DESC' },
            take: 10,
        });
        if (reports.length === 0) {
            return {
                diagnosisCount: 0,
                avgScore: 0,
                bestDimension: 'N/A',
                worstDimension: 'N/A',
                improvementTrend: 'stable',
            };
        }
        const avgScore = reports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reports.length;
        const dimensionScores = {};
        for (const report of reports) {
            if (report.dimensionScores) {
                for (const [dimension, score] of Object.entries(report.dimensionScores)) {
                    if (!dimensionScores[dimension]) {
                        dimensionScores[dimension] = [];
                    }
                    dimensionScores[dimension].push(score);
                }
            }
        }
        const dimensionAvg = {};
        for (const [dimension, scores] of Object.entries(dimensionScores)) {
            dimensionAvg[dimension] = scores.reduce((a, b) => a + b, 0) / scores.length;
        }
        const sortedDimensions = Object.entries(dimensionAvg).sort((a, b) => b[1] - a[1]);
        let improvementTrend = 'stable';
        if (reports.length >= 2) {
            const recentAvg = (reports[0]?.overallScore || 0 + reports[1]?.overallScore || 0) / 2;
            const olderAvg = (reports[reports.length - 1]?.overallScore || 0 +
                reports[reports.length - 2]?.overallScore || 0) /
                2;
            if (recentAvg > olderAvg + 0.05) {
                improvementTrend = 'improving';
            }
            else if (recentAvg < olderAvg - 0.05) {
                improvementTrend = 'declining';
            }
        }
        return {
            diagnosisCount: reports.length,
            avgScore,
            bestDimension: sortedDimensions[0]?.[0] || 'N/A',
            worstDimension: sortedDimensions[sortedDimensions.length - 1]?.[0] || 'N/A',
            improvementTrend,
        };
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
        return total > 0 ? Math.round((filled / total) * 100) / 100 : 0;
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
    getDimensionScores(knowledge) {
        const scores = {
            brand_positioning: this.isFieldComplete(knowledge.bizPositioning) ? 0.8 : 0.3,
            content_optimization: this.isFieldComplete(knowledge.productService) ? 0.8 : 0.3,
            seo_health: this.isFieldComplete(knowledge.geoGoals) ? 0.7 : 0.3,
            competitor_comparison: this.isFieldComplete(knowledge.competitorMarket) ? 0.7 : 0.3,
        };
        return scores;
    }
    determineHealthLevel(completenessScore, diagnosisScore) {
        const effectiveScore = diagnosisScore !== null && diagnosisScore !== undefined
            ? (completenessScore + diagnosisScore) / 2
            : completenessScore;
        if (effectiveScore >= 0.8)
            return 'excellent';
        if (effectiveScore >= 0.6)
            return 'good';
        if (effectiveScore >= 0.4)
            return 'fair';
        return 'poor';
    }
    generateRecommendations(knowledge, completenessScore) {
        const recommendations = [];
        if (completenessScore < 0.5) {
            recommendations.push('知识库完整度较低，建议优先完善基础信息');
        }
        if (!this.isFieldComplete(knowledge.basicInfo)) {
            recommendations.push('请完善企业基础信息（公司名称、行业等）');
        }
        if (!this.isFieldComplete(knowledge.bizPositioning)) {
            recommendations.push('建议完善核心业务定位描述');
        }
        if (!this.isFieldComplete(knowledge.productService)) {
            recommendations.push('请添加产品/服务详情');
        }
        if (!this.isFieldComplete(knowledge.geoGoals)) {
            recommendations.push('建议明确GEO推广目标');
        }
        if (completenessScore >= 0.8) {
            recommendations.push('知识库信息较为完整，可以进行GEO诊断');
        }
        return recommendations;
    }
};
exports.KnowledgeDataSourceService = KnowledgeDataSourceService;
exports.KnowledgeDataSourceService = KnowledgeDataSourceService = KnowledgeDataSourceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_knowledge_base_entity_1.BrandKnowledgeBase)),
    __param(1, (0, typeorm_1.InjectRepository)(diagnosis_report_entity_1.DiagnosisReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], KnowledgeDataSourceService);
//# sourceMappingURL=knowledge-data-source.service.js.map