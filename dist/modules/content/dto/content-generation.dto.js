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
exports.QueryContentDto = exports.CreateContentDto = exports.GenerateProductDescriptionDto = exports.GenerateJsonLdDto = exports.GenerateFaqDto = exports.GenerateSeoArticleDto = exports.ContentType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ContentType;
(function (ContentType) {
    ContentType["SEO_ARTICLE"] = "seo_article";
    ContentType["FAQ"] = "faq";
    ContentType["JSON_LD"] = "json_ld";
    ContentType["PRODUCT_DESCRIPTION"] = "product_description";
    ContentType["SOCIAL_POST"] = "social_post";
})(ContentType || (exports.ContentType = ContentType = {}));
class GenerateSeoArticleDto {
}
exports.GenerateSeoArticleDto = GenerateSeoArticleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSeoArticleDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '核心关键词' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSeoArticleDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '长尾关键词（逗号分隔）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSeoArticleDto.prototype, "longTailKeywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '文章目标字数', default: 1500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(500),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], GenerateSeoArticleDto.prototype, "targetWordCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌相关信息' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSeoArticleDto.prototype, "brandInfo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '竞争对手（逗号分隔）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSeoArticleDto.prototype, "competitors", void 0);
class GenerateFaqDto {
}
exports.GenerateFaqDto = GenerateFaqDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌/产品名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateFaqDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FAQ类型', enum: ['product', 'service', 'brand', 'general'] }),
    (0, class_validator_1.IsEnum)(['product', 'service', 'brand', 'general']),
    __metadata("design:type", String)
], GenerateFaqDto.prototype, "faqType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '问题数量', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], GenerateFaqDto.prototype, "questionCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标用户描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateFaqDto.prototype, "targetAudience", void 0);
class GenerateJsonLdDto {
}
exports.GenerateJsonLdDto = GenerateJsonLdDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JSON-LD类型', enum: ['Organization', 'LocalBusiness', 'Product', 'Article', 'FAQPage', 'BreadcrumbList'] }),
    (0, class_validator_1.IsEnum)(['Organization', 'LocalBusiness', 'Product', 'Article', 'FAQPage', 'BreadcrumbList']),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "schemaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌/企业名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '网站URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "websiteUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '联系邮箱' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '社交媒体链接（JSON格式）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "socialLinks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '产品描述（Product类型必填）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '产品价格（Product类型）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateJsonLdDto.prototype, "price", void 0);
class GenerateProductDescriptionDto {
}
exports.GenerateProductDescriptionDto = GenerateProductDescriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '产品名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateProductDescriptionDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '产品类别' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateProductDescriptionDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '产品特点（逗号分隔）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateProductDescriptionDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标用户' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateProductDescriptionDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateProductDescriptionDto.prototype, "brandName", void 0);
class CreateContentDto {
}
exports.CreateContentDto = CreateContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容标题' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容正文' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容类型', enum: ContentType }),
    (0, class_validator_1.IsEnum)(ContentType),
    __metadata("design:type", String)
], CreateContentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关联的品牌ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateContentDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '元描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关键词' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '标签（逗号分隔）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentDto.prototype, "tags", void 0);
class QueryContentDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryContentDto = QueryContentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '内容类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ContentType),
    __metadata("design:type", String)
], QueryContentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryContentDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryContentDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryContentDto.prototype, "pageSize", void 0);
//# sourceMappingURL=content-generation.dto.js.map