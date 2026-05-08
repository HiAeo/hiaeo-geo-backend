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
exports.GenerateContentDto = exports.ContentType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ContentType;
(function (ContentType) {
    ContentType["SOCIAL_POST"] = "social_post";
    ContentType["ARTICLE"] = "article";
    ContentType["AD_COPY"] = "ad_copy";
    ContentType["PRODUCT_DESCRIPTION"] = "product_description";
})(ContentType || (exports.ContentType = ContentType = {}));
class GenerateContentDto {
}
exports.GenerateContentDto = GenerateContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容类型', enum: ContentType }),
    (0, class_validator_1.IsEnum)(ContentType),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '主题/关键词' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "topic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '语气风格', enum: ['professional', 'casual', 'humorous', 'inspirational'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "tone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标受众' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关键词列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateContentDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '最大字数' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GenerateContentDto.prototype, "maxLength", void 0);
//# sourceMappingURL=generate-content.dto.js.map