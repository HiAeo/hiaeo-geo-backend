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
var KnowledgeAwareStrategyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeAwareStrategyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_knowledge_base_entity_1 = require("../../knowledge/entities/brand-knowledge-base.entity");
let KnowledgeAwareStrategyService = KnowledgeAwareStrategyService_1 = class KnowledgeAwareStrategyService {
    constructor(knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
        this.logger = new common_1.Logger(KnowledgeAwareStrategyService_1.name);
    }
    async getKnowledgeContextForStrategy(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            this.logger.warn(`未找到知识库: ${organizationId}`);
            return null;
        }
        const context = {
            brandName: this.getBrandName(knowledge),
            productDescription: this.getProductDescription(knowledge),
            targetAudience: this.getTargetAudience(knowledge),
            industry: knowledge.basicInfo?.industry || '',
            keywords: this.getKeywords(knowledge),
            competitors: this.getCompetitors(knowledge),
            brandStrengths: this.getBrandStrengths(knowledge),
            brandChallenges: this.getBrandChallenges(knowledge),
            geoTarget: this.getGeoTarget(knowledge),
            forbiddenWords: this.getForbiddenWords(knowledge),
        };
        this.logger.log(`策略上下文已构建 - org: ${organizationId}, brand: ${context.brandName}`);
        return context;
    }
    async generateStrategyFromKnowledge(organizationId, strategyType) {
        const context = await this.getKnowledgeContextForStrategy(organizationId);
        if (!context) {
            return { success: false, error: '未找到知识库，请先完善品牌知识库' };
        }
        if (!context.productDescription) {
            return { success: false, error: '知识库缺少产品/服务描述，请先完善产品服务详情' };
        }
        const strategyDto = {
            brandName: context.brandName,
            productDescription: context.productDescription,
            targetAudience: context.targetAudience,
            industry: context.industry,
            keywords: context.keywords,
            competitors: context.competitors.join(', '),
            brandStrengths: context.brandStrengths,
            brandChallenges: context.brandChallenges,
            strategyType,
            planningWeeks: 12,
            targetPlatforms: this.getTargetPlatformsFromGoals(organizationId),
        };
        return { success: true, data: strategyDto };
    }
    async validateStrategyConsistency(organizationId, strategy) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return {
                valid: false,
                warnings: ['未找到关联的知识库'],
                suggestions: ['请先创建品牌知识库'],
            };
        }
        const warnings = [];
        const suggestions = [];
        const knowledgeKeywords = this.getKeywords(knowledge);
        if (strategy.keywords) {
            const missingKeywords = knowledgeKeywords.filter((k) => !strategy.keywords.includes(k));
            if (missingKeywords.length > 0) {
                suggestions.push(`建议将以下知识库关键词纳入策略: ${missingKeywords.join(', ')}`);
            }
        }
        const knowledgeCompetitors = this.getCompetitors(knowledge);
        if (strategy.competitors) {
            const missingCompetitors = knowledgeCompetitors.filter((c) => !strategy.competitors.includes(c));
            if (missingCompetitors.length > 0) {
                warnings.push(`知识库中存在但策略未分析的竞品: ${missingCompetitors.join(', ')}`);
            }
        }
        const knowledgeAudience = this.getTargetAudience(knowledge);
        if (strategy.targetAudience && knowledgeAudience) {
            if (!strategy.targetAudience.includes(knowledgeAudience.substring(0, 10))) {
                suggestions.push('策略中的目标受众与知识库定义可能不一致，建议统一');
            }
        }
        const forbiddenWords = this.getForbiddenWords(knowledge);
        if (strategy.content && forbiddenWords.length > 0) {
            const usedForbidden = forbiddenWords.filter((w) => JSON.stringify(strategy.content).includes(w));
            if (usedForbidden.length > 0) {
                warnings.push(`策略内容可能包含禁忌词: ${usedForbidden.join(', ')}`);
            }
        }
        return {
            valid: warnings.length === 0,
            warnings,
            suggestions,
        };
    }
    async getStrategyRecommendationsFromDiagnosis(organizationId, diagnosisReport) {
        const recommendations = [];
        if (!diagnosisReport) {
            return recommendations;
        }
        if (diagnosisReport.issues && Array.isArray(diagnosisReport.issues)) {
            diagnosisReport.issues.forEach((issue) => {
                if (issue.severity === 'high' || issue.severity === 'critical') {
                    recommendations.push(`优先解决: ${issue.title}`);
                }
            });
        }
        if (diagnosisReport.suggestions && Array.isArray(diagnosisReport.suggestions)) {
            diagnosisReport.suggestions.forEach((suggestion, index) => {
                if (index < 5) {
                    recommendations.push(`策略建议: ${suggestion.content || suggestion}`);
                }
            });
        }
        if (diagnosisReport.dimensionScores) {
            const lowScoreDimensions = Object.entries(diagnosisReport.dimensionScores)
                .filter(([_, score]) => score < 0.6)
                .map(([dimension]) => dimension);
            if (lowScoreDimensions.length > 0) {
                recommendations.push(`重点优化维度: ${lowScoreDimensions.join(', ')}`);
            }
        }
        return recommendations;
    }
    getBrandName(knowledge) {
        return (knowledge.basicInfo?.companyShortName ||
            knowledge.basicInfo?.companyName ||
            '未命名品牌');
    }
    getProductDescription(knowledge) {
        const parts = [];
        if (knowledge.bizPositioning?.coreBizIntro) {
            parts.push(knowledge.bizPositioning.coreBizIntro);
        }
        if (knowledge.productService?.productSellPoint) {
            parts.push(knowledge.productService.productSellPoint);
        }
        if (knowledge.productService?.productServiceList && knowledge.productService.productServiceList.length > 0) {
            const products = knowledge.productService.productServiceList
                .map((p) => p.productName)
                .join('、');
            parts.push(`主要产品/服务: ${products}`);
        }
        return parts.join('; ');
    }
    getTargetAudience(knowledge) {
        return knowledge.bizPositioning?.targetCustomer || '';
    }
    getKeywords(knowledge) {
        const keywords = [];
        if (knowledge.productService?.coreKeywords) {
            keywords.push(...knowledge.productService.coreKeywords);
        }
        if (knowledge.basicInfo?.companyShortName) {
            keywords.push(knowledge.basicInfo.companyShortName);
        }
        if (knowledge.basicInfo?.industry) {
            keywords.push(knowledge.basicInfo.industry);
        }
        return [...new Set(keywords)].slice(0, 10);
    }
    getCompetitors(knowledge) {
        if (!knowledge.competitorMarket?.competitors) {
            return [];
        }
        return knowledge.competitorMarket.competitors
            .map((c) => c.competitorName)
            .filter(Boolean);
    }
    getBrandStrengths(knowledge) {
        return (knowledge.bizPositioning?.differentialAdvantage ||
            '待补充品牌优势');
    }
    getBrandChallenges(knowledge) {
        const challenges = [];
        if (knowledge.bizPositioning?.customerPainPoint) {
            challenges.push(`客户痛点: ${knowledge.bizPositioning.customerPainPoint}`);
        }
        if (knowledge.competitorMarket?.marketGap) {
            challenges.push(`市场空白: ${knowledge.competitorMarket.marketGap}`);
        }
        return challenges.join('; ') || '待分析品牌挑战';
    }
    getGeoTarget(knowledge) {
        const parts = [];
        if (knowledge.geoGoals?.keyPromotionArea) {
            parts.push(knowledge.geoGoals.keyPromotionArea);
        }
        if (knowledge.geoGoals?.promotionGoals) {
            parts.push(`推广目标: ${knowledge.geoGoals.promotionGoals.join(', ')}`);
        }
        return parts.join('; ');
    }
    getForbiddenWords(knowledge) {
        const words = [];
        if (knowledge.supplement?.brandForbiddenWords) {
            words.push(...knowledge.supplement.brandForbiddenWords
                .split(/[,，]/)
                .filter(Boolean));
        }
        if (knowledge.bizPositioning?.forbiddenBiz) {
            const forbiddenMatches = knowledge.bizPositioning.forbiddenBiz.match(/[^\s,，]+/g);
            if (forbiddenMatches) {
                words.push(...forbiddenMatches);
            }
        }
        return [...new Set(words)];
    }
    getTargetPlatformsFromGoals(organizationId) {
        return [];
    }
};
exports.KnowledgeAwareStrategyService = KnowledgeAwareStrategyService;
exports.KnowledgeAwareStrategyService = KnowledgeAwareStrategyService = KnowledgeAwareStrategyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_knowledge_base_entity_1.BrandKnowledgeBase)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KnowledgeAwareStrategyService);
//# sourceMappingURL=knowledge-aware-strategy.service.js.map