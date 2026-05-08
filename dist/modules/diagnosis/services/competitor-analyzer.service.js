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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitorAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const engine_manager_1 = require("../../ai/adapters/engine-manager");
const ai_service_1 = require("../../ai/services/ai.service");
let CompetitorAnalyzerService = class CompetitorAnalyzerService {
    constructor(engineManager, aiService) {
        this.engineManager = engineManager;
        this.aiService = aiService;
    }
    async analyzeCompetitors(brandName, competitors, engine) {
        const selfDiagnosis = await this.engineManager.diagnoseBrand({ brandName }, engine);
        const competitorDiagnoses = [];
        for (const competitor of competitors) {
            try {
                const diagnosis = await this.engineManager.diagnoseBrand({ brandName: competitor }, engine);
                competitorDiagnoses.push({ name: competitor, diagnosis });
            }
            catch (error) {
                console.error(`竞品 ${competitor} 诊断失败:`, error.message);
            }
        }
        const competitorComparisons = competitorDiagnoses.map(({ name, diagnosis }) => ({
            competitorName: name,
            overallScore: diagnosis.overallScore,
            dimensionScores: diagnosis.dimensionScores,
            strengths: diagnosis.competitiveAdvantages,
            weaknesses: diagnosis.potentialIssues,
            gap: 0,
        }));
        const selfScore = selfDiagnosis.overallScore || 70;
        for (const comp of competitorComparisons) {
            comp.gap = selfScore - (comp.overallScore || 70);
        }
        const positioningMap = [
            { x: selfScore, y: 70, label: brandName, type: 'self' },
            ...competitorComparisons.map(comp => ({
                x: comp.overallScore || 70,
                y: 65 + Math.random() * 20,
                label: comp.competitorName,
                type: 'competitor'
            }))
        ];
        const marketGaps = this.identifyMarketGaps(selfDiagnosis, competitorDiagnoses.map(c => c.diagnosis));
        const recommendations = this.generateRecommendations(selfDiagnosis, competitorComparisons);
        return {
            selfBrand: brandName,
            competitors: competitorComparisons,
            positioningMap,
            marketGaps,
            recommendations,
        };
    }
    identifyMarketGaps(selfDiagnosis, competitorDiagnoses) {
        const gaps = [];
        const selfIssues = selfDiagnosis.potentialIssues;
        for (const competitor of competitorDiagnoses) {
            const competitorAdvantages = competitor.competitiveAdvantages;
            for (const issue of selfIssues) {
                if (!competitorAdvantages.some(adv => adv.includes(issue))) {
                    gaps.push(`市场空白: ${issue} - 竞品未覆盖`);
                }
            }
        }
        return [...new Set(gaps)].slice(0, 5);
    }
    generateRecommendations(selfDiagnosis, competitors) {
        const recommendations = [];
        if (selfDiagnosis.contentSuggestions.length > 0) {
            recommendations.push(...selfDiagnosis.contentSuggestions.slice(0, 3));
        }
        const strongestCompetitor = competitors.reduce((max, c) => c.gap > max.gap ? c : max, competitors[0]);
        if (strongestCompetitor) {
            recommendations.push(`参考竞品 ${strongestCompetitor.competitorName} 的成功策略`);
        }
        const avgScore = competitors.reduce((sum, c) => sum + (c.overallScore || 70), 0) / competitors.length;
        if (selfDiagnosis.confidence < 0.8) {
            recommendations.push('提升GEO诊断置信度，加强数据收集');
        }
        return recommendations;
    }
    async identifyCompetitorsFromMarket(text) {
        const response = await this.aiService.chat({
            messages: [
                { role: 'system', content: '你是一个市场分析专家，请从文本中识别主要竞品。' },
                { role: 'user', content: `从以下文本中识别出主要竞品品牌，JSON格式返回：{"competitors": ["竞品1", "竞品2", ...]}\n\n${text}` }
            ]
        });
        return this.extractCompetitorsFromText(response.message.content);
    }
    extractCompetitorsFromText(text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                return data.competitors || [];
            }
        }
        catch { }
        return [];
    }
};
exports.CompetitorAnalyzerService = CompetitorAnalyzerService;
exports.CompetitorAnalyzerService = CompetitorAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [engine_manager_1.EngineManager,
        ai_service_1.AiService])
], CompetitorAnalyzerService);
//# sourceMappingURL=competitor-analyzer.service.js.map