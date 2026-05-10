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
exports.GenerateStrategyFromReportDto = exports.UpdateStrategyDto = exports.CreateStrategyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const strategy_entity_1 = require("../entities/strategy.entity");
class CreateStrategyDto {
}
exports.CreateStrategyDto = CreateStrategyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStrategyDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '用户ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStrategyDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '策略名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStrategyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '策略类型', enum: strategy_entity_1.StrategyType }),
    (0, class_validator_1.IsEnum)(strategy_entity_1.StrategyType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStrategyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标关键词' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateStrategyDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标渠道' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateStrategyDto.prototype, "channels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '诊断报告ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStrategyDto.prototype, "diagnosisReportId", void 0);
class UpdateStrategyDto {
}
exports.UpdateStrategyDto = UpdateStrategyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '策略名称' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStrategyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '策略状态' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStrategyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '内容' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateStrategyDto.prototype, "content", void 0);
class GenerateStrategyFromReportDto {
}
exports.GenerateStrategyFromReportDto = GenerateStrategyFromReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '诊断报告ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateStrategyFromReportDto.prototype, "diagnosisReportId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateStrategyFromReportDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '用户ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateStrategyFromReportDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '策略名称' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateStrategyFromReportDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '策略类型', enum: strategy_entity_1.StrategyType }),
    (0, class_validator_1.IsEnum)(strategy_entity_1.StrategyType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateStrategyFromReportDto.prototype, "type", void 0);
//# sourceMappingURL=strategy.dto.js.map