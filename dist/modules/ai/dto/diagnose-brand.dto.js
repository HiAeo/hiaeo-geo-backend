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
exports.DiagnoseBrandDto = exports.DiagnosisDimensionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class DiagnosisDimensionDto {
}
exports.DiagnosisDimensionDto = DiagnosisDimensionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '维度名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiagnosisDimensionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '权重 (0-1)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DiagnosisDimensionDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DiagnosisDimensionDto.prototype, "enabled", void 0);
class DiagnoseBrandDto {
}
exports.DiagnoseBrandDto = DiagnoseBrandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiagnoseBrandDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌官网URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiagnoseBrandDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '行业类别' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiagnoseBrandDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标市场' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiagnoseBrandDto.prototype, "targetMarket", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '诊断维度配置', type: [DiagnosisDimensionDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], DiagnoseBrandDto.prototype, "dimensions", void 0);
//# sourceMappingURL=diagnose-brand.dto.js.map