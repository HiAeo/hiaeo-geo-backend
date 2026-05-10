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
exports.ExportContentDto = exports.ExportFormat = exports.QueryPublishDto = exports.PlatformPublishResult = exports.PublishResultDto = exports.BatchPublishDto = exports.PublishContentDto = exports.PlatformConfig = exports.PublishStatus = exports.PublishContentType = exports.PublishPlatform = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var PublishPlatform;
(function (PublishPlatform) {
    PublishPlatform["WEBSITE"] = "website";
    PublishPlatform["WECHAT"] = "wechat";
    PublishPlatform["WECHAT_MOMENTS"] = "wechat_moments";
    PublishPlatform["WEIBO"] = "weibo";
    PublishPlatform["DOUYIN"] = "douyin";
    PublishPlatform["XIAOHONGSHU"] = "xiaohongshu";
    PublishPlatform["BILIBILI"] = "bilibili";
    PublishPlatform["BAIDU"] = "baidu";
    PublishPlatform["TAOBAO"] = "taobao";
    PublishPlatform["TMALL"] = "tmall";
    PublishPlatform["JD"] = "jd";
    PublishPlatform["CUSTOM"] = "custom";
})(PublishPlatform || (exports.PublishPlatform = PublishPlatform = {}));
var PublishContentType;
(function (PublishContentType) {
    PublishContentType["SEO_ARTICLE"] = "seo_article";
    PublishContentType["FAQ"] = "faq";
    PublishContentType["JSON_LD"] = "json_ld";
    PublishContentType["PRODUCT_DESCRIPTION"] = "product_description";
    PublishContentType["SOCIAL_POST"] = "social_post";
    PublishContentType["VIDEO_SCRIPT"] = "video_script";
    PublishContentType["AD_COPY"] = "ad_copy";
})(PublishContentType || (exports.PublishContentType = PublishContentType = {}));
var PublishStatus;
(function (PublishStatus) {
    PublishStatus["DRAFT"] = "draft";
    PublishStatus["PENDING"] = "pending";
    PublishStatus["PUBLISHING"] = "publishing";
    PublishStatus["PUBLISHED"] = "published";
    PublishStatus["FAILED"] = "failed";
    PublishStatus["SCHEDULED"] = "scheduled";
})(PublishStatus || (exports.PublishStatus = PublishStatus = {}));
class PlatformConfig {
}
exports.PlatformConfig = PlatformConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '平台类型', enum: PublishPlatform }),
    (0, class_validator_1.IsEnum)(PublishPlatform),
    __metadata("design:type", String)
], PlatformConfig.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否启用' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PlatformConfig.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '平台特定配置(JSON)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PlatformConfig.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '发布草稿还是正式发布' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PlatformConfig.prototype, "isDraft", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排期发布时间(ISO格式)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PlatformConfig.prototype, "scheduledTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类/目录' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PlatformConfig.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '标签' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PlatformConfig.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '封面图片URL' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PlatformConfig.prototype, "coverImage", void 0);
class PublishContentDto {
}
exports.PublishContentDto = PublishContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容标题' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容主体' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '内容摘要/描述' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容类型', enum: PublishContentType }),
    (0, class_validator_1.IsEnum)(PublishContentType),
    __metadata("design:type", String)
], PublishContentDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关键词' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PublishContentDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SEO元标题' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SEO元描述' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标平台', type: [PlatformConfig] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlatformConfig),
    __metadata("design:type", Array)
], PublishContentDto.prototype, "targetPlatforms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '原始内容ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "sourceContentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '附加数据(JSON)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishContentDto.prototype, "additionalData", void 0);
class BatchPublishDto {
}
exports.BatchPublishDto = BatchPublishDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容ID列表', type: [String] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BatchPublishDto.prototype, "contentIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目标平台', type: [PlatformConfig] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlatformConfig),
    __metadata("design:type", Array)
], BatchPublishDto.prototype, "targetPlatforms", void 0);
class PublishResultDto {
}
exports.PublishResultDto = PublishResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '发布记录ID' }),
    __metadata("design:type", String)
], PublishResultDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容标题' }),
    __metadata("design:type", String)
], PublishResultDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '发布状态', enum: PublishStatus }),
    __metadata("design:type", String)
], PublishResultDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '平台发布结果' }),
    __metadata("design:type", Array)
], PublishResultDto.prototype, "platformResults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    __metadata("design:type", Date)
], PublishResultDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '发布时间' }),
    __metadata("design:type", Date)
], PublishResultDto.prototype, "publishedAt", void 0);
class PlatformPublishResult {
}
exports.PlatformPublishResult = PlatformPublishResult;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '平台', enum: PublishPlatform }),
    __metadata("design:type", String)
], PlatformPublishResult.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '平台名称' }),
    __metadata("design:type", String)
], PlatformPublishResult.prototype, "platformName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '发布状态', enum: PublishStatus }),
    __metadata("design:type", String)
], PlatformPublishResult.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '平台返回的消息' }),
    __metadata("design:type", String)
], PlatformPublishResult.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '平台返回的内容ID' }),
    __metadata("design:type", String)
], PlatformPublishResult.prototype, "platformContentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '平台返回的URL' }),
    __metadata("design:type", String)
], PlatformPublishResult.prototype, "platformUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '错误信息' }),
    __metadata("design:type", String)
], PlatformPublishResult.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '发布时间' }),
    __metadata("design:type", Date)
], PlatformPublishResult.prototype, "publishedAt", void 0);
class QueryPublishDto {
}
exports.QueryPublishDto = QueryPublishDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPublishDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '内容类型', enum: PublishContentType }),
    (0, class_validator_1.IsEnum)(PublishContentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPublishDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '发布状态', enum: PublishStatus }),
    (0, class_validator_1.IsEnum)(PublishStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPublishDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '平台', enum: PublishPlatform }),
    (0, class_validator_1.IsEnum)(PublishPlatform),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPublishDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始日期' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPublishDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束日期' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPublishDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryPublishDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryPublishDto.prototype, "pageSize", void 0);
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["TXT"] = "txt";
    ExportFormat["HTML"] = "html";
    ExportFormat["MD"] = "md";
    ExportFormat["JSON"] = "json";
    ExportFormat["DOCX"] = "docx";
    ExportFormat["PDF"] = "pdf";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
class ExportContentDto {
}
exports.ExportContentDto = ExportContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容ID列表', type: [String] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExportContentDto.prototype, "contentIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '导出格式', enum: ExportFormat, default: ExportFormat.TXT }),
    (0, class_validator_1.IsEnum)(ExportFormat),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExportContentDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否包含元数据' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ExportContentDto.prototype, "includeMetadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '文件名' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExportContentDto.prototype, "fileName", void 0);
//# sourceMappingURL=publish.dto.js.map