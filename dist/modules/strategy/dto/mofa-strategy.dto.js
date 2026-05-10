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
exports.QueryMofaStrategyDto = exports.MofaStrategyResultDto = exports.MofaStrategyContent = exports.GenerateMofaStrategyDto = exports.ContentPlatform = exports.StrategyType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var StrategyType;
(function (StrategyType) {
    StrategyType["CONTENT"] = "content";
    StrategyType["FAQ"] = "faq";
    StrategyType["PRODUCT"] = "product";
    StrategyType["COMPETITOR"] = "competitor";
    StrategyType["SEO"] = "seo";
    StrategyType["SOCIAL"] = "social";
})(StrategyType || (exports.StrategyType = StrategyType = {}));
var ContentPlatform;
(function (ContentPlatform) {
    ContentPlatform["WEBSITE"] = "website";
    ContentPlatform["WECHAT"] = "wechat";
    ContentPlatform["WECHAT_MOMENTS"] = "wechat_moments";
    ContentPlatform["WEIBO"] = "weibo";
    ContentPlatform["DOUYIN"] = "douyin";
    ContentPlatform["XIAOHONGSHU"] = "xiaohongshu";
    ContentPlatform["BILIBILI"] = "bilibili";
    ContentPlatform["BAIDU"] = "baidu";
    ContentPlatform["TAOBAO"] = "taobao";
    ContentPlatform["TMALL"] = "tmall";
    ContentPlatform["JD"] = "jd";
})(ContentPlatform || (exports.ContentPlatform = ContentPlatform = {}));
class GenerateMofaStrategyDto {
}
exports.GenerateMofaStrategyDto = GenerateMofaStrategyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌名称', example: '魔鲸科技' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌ID', example: 'brand_001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略类型', enum: StrategyType, example: StrategyType.CONTENT }),
    (0, class_validator_1.IsEnum)(StrategyType),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "strategyType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '核心关键词', example: ['AI写作', '智能营销'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GenerateMofaStrategyDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标平台', type: [String], enum: ContentPlatform }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GenerateMofaStrategyDto.prototype, "targetPlatforms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标受众', example: '25-40岁企业管理者' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '竞争对手', example: '竞品A, 竞品B' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "competitors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '产品/服务描述', example: 'AI驱动的智能内容生成平台' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "productDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '行业领域', example: 'SaaS/企业服务' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '预算范围', example: '10-50万/年' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "budget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '计划周期（周）', example: 12, minimum: 1, maximum: 52 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(52),
    __metadata("design:type", Number)
], GenerateMofaStrategyDto.prototype, "planningWeeks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌优势', example: '技术领先, 用户体验好' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "brandStrengths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌挑战', example: '品牌认知度不高, 内容产出效率低' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateMofaStrategyDto.prototype, "brandChallenges", void 0);
class MofaStrategyContent {
}
exports.MofaStrategyContent = MofaStrategyContent;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略摘要' }),
    __metadata("design:type", String)
], MofaStrategyContent.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '核心目标' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "coreObjectives", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关键绩效指标' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "kpis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容主题建议' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "contentThemes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容类型分布' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "contentTypeDistribution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '核心关键词' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "coreKeywords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '长尾关键词' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "longTailKeywords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '平台执行计划' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "platformPlan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '执行时间线' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "timeline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '竞品对比' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "competitorAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '执行建议' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "recommendations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '潜在风险' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "risks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '资源需求' }),
    __metadata("design:type", Array)
], MofaStrategyContent.prototype, "resourceRequirements", void 0);
class MofaStrategyResultDto {
}
exports.MofaStrategyResultDto = MofaStrategyResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略ID' }),
    __metadata("design:type", String)
], MofaStrategyResultDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略名称' }),
    __metadata("design:type", String)
], MofaStrategyResultDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略类型', enum: StrategyType }),
    __metadata("design:type", String)
], MofaStrategyResultDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌名称' }),
    __metadata("design:type", String)
], MofaStrategyResultDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略状态', enum: ['draft', 'active', 'completed'] }),
    __metadata("design:type", String)
], MofaStrategyResultDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略内容' }),
    __metadata("design:type", MofaStrategyContent)
], MofaStrategyResultDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    __metadata("design:type", Date)
], MofaStrategyResultDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    __metadata("design:type", Date)
], MofaStrategyResultDto.prototype, "updatedAt", void 0);
class QueryMofaStrategyDto {
}
exports.QueryMofaStrategyDto = QueryMofaStrategyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryMofaStrategyDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '策略类型', enum: StrategyType }),
    (0, class_validator_1.IsEnum)(StrategyType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryMofaStrategyDto.prototype, "strategyType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '状态', enum: ['draft', 'active', 'completed'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryMofaStrategyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryMofaStrategyDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryMofaStrategyDto.prototype, "pageSize", void 0);
//# sourceMappingURL=mofa-strategy.dto.js.map