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
var KnowledgeAwareContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeAwareContentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_knowledge_base_entity_1 = require("../../knowledge/entities/brand-knowledge-base.entity");
let KnowledgeAwareContentService = KnowledgeAwareContentService_1 = class KnowledgeAwareContentService {
    constructor(knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
        this.logger = new common_1.Logger(KnowledgeAwareContentService_1.name);
    }
    async buildSeoArticleContext(organizationId, customKeyword) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            this.logger.warn(`未找到知识库: ${organizationId}`);
            return null;
        }
        const keyword = customKeyword || this.getPrimaryKeyword(knowledge);
        if (!keyword) {
            this.logger.warn(`知识库缺少关键词信息: ${organizationId}`);
            return null;
        }
        return {
            brandName: this.getBrandName(knowledge),
            keyword,
            longTailKeywords: this.getLongTailKeywords(knowledge),
            targetWordCount: 1500,
            brandInfo: this.getBrandInfo(knowledge),
            competitors: this.getCompetitorNames(knowledge),
        };
    }
    async buildFaqContext(organizationId, faqType = 'brand') {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return null;
        }
        return {
            name: this.getBrandName(knowledge),
            faqType,
            questionCount: 10,
            targetAudience: this.getTargetAudience(knowledge),
        };
    }
    async buildProductDescriptionContext(organizationId, productName) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return null;
        }
        const targetProduct = productName
            ? knowledge.productService?.productServiceList?.find((p) => p.productName === productName)
            : knowledge.productService?.productServiceList?.[0];
        if (!targetProduct) {
            return null;
        }
        return {
            productName: targetProduct.productName || productName,
            category: knowledge.basicInfo?.industry || '',
            features: targetProduct.productDesc || knowledge.productService?.productSellPoint,
            targetAudience: this.getTargetAudience(knowledge),
            brandName: this.getBrandName(knowledge),
        };
    }
    async getForbiddenWords(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return [];
        }
        const words = new Set();
        if (knowledge.supplement?.brandForbiddenWords) {
            knowledge.supplement.brandForbiddenWords
                .split(/[,，]/)
                .filter(Boolean)
                .forEach((w) => words.add(w));
        }
        if (knowledge.bizPositioning?.forbiddenBiz) {
            const matches = knowledge.bizPositioning.forbiddenBiz.match(/[^\s,，]+/g);
            if (matches) {
                matches.forEach((w) => words.add(w));
            }
        }
        if (knowledge.supplement?.complianceRequirements) {
            const matches = knowledge.supplement.complianceRequirements.match(/[^\s,，]+/g);
            if (matches) {
                matches.forEach((w) => words.add(w));
            }
        }
        return Array.from(words);
    }
    async checkContentAgainstKnowledge(organizationId, content) {
        const forbiddenWords = await this.getForbiddenWords(organizationId);
        if (forbiddenWords.length === 0) {
            return { hasViolation: false, foundWords: [], suggestions: [] };
        }
        const foundWords = forbiddenWords.filter((word) => content.includes(word));
        const suggestions = [];
        if (foundWords.length > 0) {
            suggestions.push(`内容包含 ${foundWords.length} 个禁忌词，请修改后重试`);
            suggestions.push(`禁忌词列表: ${foundWords.join(', ')}`);
        }
        return {
            hasViolation: foundWords.length > 0,
            foundWords,
            suggestions,
        };
    }
    async getDifferentialAdvantage(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        return knowledge?.bizPositioning?.differentialAdvantage || null;
    }
    async getBrandSummary(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return null;
        }
        const highlights = [];
        if (knowledge.bizPositioning?.differentialAdvantage) {
            highlights.push(knowledge.bizPositioning.differentialAdvantage);
        }
        if (knowledge.basicInfo?.companyScale) {
            highlights.push(`企业规模: ${knowledge.basicInfo.companyScale}`);
        }
        return {
            name: this.getBrandName(knowledge),
            industry: knowledge.basicInfo?.industry || '',
            coreBiz: knowledge.bizPositioning?.coreBizIntro || '',
            targetAudience: this.getTargetAudience(knowledge),
            highlights,
        };
    }
    getBrandName(knowledge) {
        return (knowledge.basicInfo?.companyShortName ||
            knowledge.basicInfo?.companyName ||
            '未命名品牌');
    }
    getPrimaryKeyword(knowledge) {
        if (knowledge.productService?.coreKeywords && knowledge.productService.coreKeywords.length > 0) {
            return knowledge.productService.coreKeywords[0];
        }
        if (knowledge.basicInfo?.industry) {
            const brandName = this.getBrandName(knowledge);
            return `${knowledge.basicInfo.industry} ${brandName}`;
        }
        return null;
    }
    getLongTailKeywords(knowledge) {
        if (!knowledge.productService?.coreKeywords) {
            return '';
        }
        const brandName = this.getBrandName(knowledge);
        const keywords = knowledge.productService.coreKeywords.slice(0, 5);
        return keywords.map((k) => `${k} ${brandName}`).join(', ');
    }
    getBrandInfo(knowledge) {
        const parts = [];
        if (knowledge.basicInfo?.companyShortName) {
            parts.push(knowledge.basicInfo.companyShortName);
        }
        if (knowledge.basicInfo?.industry) {
            parts.push(knowledge.basicInfo.industry);
        }
        if (knowledge.bizPositioning?.coreBizIntro) {
            parts.push(knowledge.bizPositioning.coreBizIntro);
        }
        if (knowledge.bizPositioning?.differentialAdvantage) {
            parts.push(`优势: ${knowledge.bizPositioning.differentialAdvantage}`);
        }
        return parts.join(' | ');
    }
    getCompetitorNames(knowledge) {
        if (!knowledge.competitorMarket?.competitors) {
            return undefined;
        }
        return knowledge.competitorMarket.competitors
            .map((c) => c.competitorName)
            .filter(Boolean)
            .join(', ');
    }
    getTargetAudience(knowledge) {
        return (knowledge.bizPositioning?.targetCustomer ||
            knowledge.bizPositioning?.targetCustomer ||
            '');
    }
};
exports.KnowledgeAwareContentService = KnowledgeAwareContentService;
exports.KnowledgeAwareContentService = KnowledgeAwareContentService = KnowledgeAwareContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_knowledge_base_entity_1.BrandKnowledgeBase)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KnowledgeAwareContentService);
//# sourceMappingURL=knowledge-aware-content.service.js.map