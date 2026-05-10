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
exports.BrandQueryDto = exports.UpdateBrandDto = exports.CreateBrandDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const brand_entity_1 = require("../entities/brand.entity");
class CreateBrandDto {
}
exports.CreateBrandDto = CreateBrandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌名称', example: '华为' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌域名', example: 'huawei.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "domain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: brand_entity_1.BrandIndustry, description: '所属行业' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(brand_entity_1.BrandIndustry),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌Logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SEO数据' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateBrandDto.prototype, "seoData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '联系方式' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateBrandDto.prototype, "contactInfo", void 0);
class UpdateBrandDto {
}
exports.UpdateBrandDto = UpdateBrandDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌域名' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "domain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: brand_entity_1.BrandIndustry, description: '所属行业' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(brand_entity_1.BrandIndustry),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌Logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: brand_entity_1.BrandStatus, description: '品牌状态' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(brand_entity_1.BrandStatus),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SEO数据' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateBrandDto.prototype, "seoData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '联系方式' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateBrandDto.prototype, "contactInfo", void 0);
class BrandQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.BrandQueryDto = BrandQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '搜索关键词' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BrandQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: brand_entity_1.BrandIndustry, description: '行业筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(brand_entity_1.BrandIndustry),
    __metadata("design:type", String)
], BrandQueryDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: brand_entity_1.BrandStatus, description: '状态筛选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(brand_entity_1.BrandStatus),
    __metadata("design:type", String)
], BrandQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '当前页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BrandQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BrandQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=brand.dto.js.map