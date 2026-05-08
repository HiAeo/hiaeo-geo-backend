"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthScoreCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const diagnosis_report_entity_1 = require("../entities/diagnosis-report.entity");
let HealthScoreCalculatorService = class HealthScoreCalculatorService {
    constructor() {
        this.defaultWeights = {
            '技术SEO基础': 0.25,
            '内容质量与相关性': 0.25,
            '外部链接与权威性': 0.20,
            '用户体验': 0.15,
            '地理定位优化': 0.15,
        };
    }
    calculate(aiResult, customDimensions) {
        const dimensionScores = this.processDimensionScores(aiResult.dimensionScores, customDimensions);
        const overallScore = this.calculateWeightedScore(dimensionScores);
        const grade = this.determineGrade(overallScore);
        const healthLevel = this.calculateHealthLevel(overallScore);
        const riskFactors = this.identifyRiskFactors(dimensionScores);
        this.analyzeTrends(dimensionScores);
        return {
            overallScore,
            grade,
            healthLevel,
            dimensionScores,
            riskFactors,
        };
    }
    processDimensionScores(rawScores, customDimensions) {
        const customMap = new Map(customDimensions?.map((d) => [d.name, d]) || []);
        return rawScores.map((dim) => {
            const custom = customMap.get(dim.name);
            const weight = custom?.weight || this.defaultWeights[dim.name] || 0.2;
            return {
                name: dim.name,
                score: dim.score,
                weight,
                analysis: dim.analysis,
                trend: 'stable',
            };
        });
    }
    calculateWeightedScore(dimensions) {
        if (dimensions.length === 0)
            return 0;
        const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
        if (totalWeight === 0)
            return 0;
        const weightedSum = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
        return Math.round(weightedSum / totalWeight);
    }
    determineGrade(score) {
        if (score >= 90)
            return diagnosis_report_entity_1.ReportGrade.EXCELLENT;
        if (score >= 75)
            return diagnosis_report_entity_1.ReportGrade.GOOD;
        if (score >= 60)
            return diagnosis_report_entity_1.ReportGrade.FAIR;
        if (score >= 40)
            return diagnosis_report_entity_1.ReportGrade.POOR;
        return diagnosis_report_entity_1.ReportGrade.VERY_POOR;
    }
    calculateHealthLevel(score) {
        if (score >= 90)
            return 5;
        if (score >= 75)
            return 4;
        if (score >= 60)
            return 3;
        if (score >= 40)
            return 2;
        return 1;
    }
    identifyRiskFactors(dimensions) {
        const factors = [];
        for (const dim of dimensions) {
            if (dim.score < 50) {
                factors.push({
                    dimension: dim.name,
                    risk: `${dim.name}得分过低(${dim.score}分)`,
                    severity: dim.score < 30 ? 'critical' : dim.score < 40 ? 'high' : 'medium',
                    recommendation: this.getRecommendation(dim.name, dim.score),
                });
            }
        }
        return factors.sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
    getRecommendation(dimension, score) {
        const recommendations = {
            '技术SEO基础': '建议进行技术SEO审计，检查网站结构、页面速度、移动端适配等技术因素',
            '内容质量与相关性': '建议增加原创深度内容，优化关键词布局，提升内容价值',
            '外部链接与权威性': '建议积极建设高质量外链，获取行业权威网站的推荐',
            '用户体验': '建议优化网站导航结构，提升页面加载速度，改善移动端体验',
            '地理定位优化': '建议完善地理标签，增加本地化内容，优化Google Earth相关展示',
        };
        return recommendations[dimension] || '建议进行全面诊断以确定具体问题';
    }
    analyzeTrends(dimensions) {
        for (const dim of dimensions) {
            if (dim.score >= 80) {
                dim.trend = 'stable';
            }
            else if (dim.score < 60) {
                dim.trend = 'down';
            }
            else {
                dim.trend = 'stable';
            }
        }
    }
    calculateImprovementPotential(currentScore, targetScore) {
        const improvementNeeded = targetScore - currentScore;
        let estimatedEffort;
        if (improvementNeeded <= 5) {
            estimatedEffort = 'low';
        }
        else if (improvementNeeded <= 15) {
            estimatedEffort = 'medium';
        }
        else {
            estimatedEffort = 'high';
        }
        return {
            improvementNeeded,
            estimatedEffort,
            priorityDimensions: [],
        };
    }
    exportReportData(result) {
        return {
            overallScore: result.overallScore,
            grade: result.grade,
            healthLevel: result.healthLevel,
            dimensionBreakdown: result.dimensionScores.map((d) => ({
                name: d.name,
                score: d.score,
                weight: d.weight,
                contribution: Math.round(d.score * d.weight),
                trend: d.trend,
            })),
            riskSummary: {
                total: result.riskFactors.length,
                critical: result.riskFactors.filter((r) => r.severity === 'critical').length,
                high: result.riskFactors.filter((r) => r.severity === 'high').length,
                medium: result.riskFactors.filter((r) => r.severity === 'medium').length,
            },
        };
    }
};
exports.HealthScoreCalculatorService = HealthScoreCalculatorService;
exports.HealthScoreCalculatorService = HealthScoreCalculatorService = __decorate([
    (0, common_1.Injectable)()
], HealthScoreCalculatorService);
//# sourceMappingURL=health-score-calculator.service.js.map