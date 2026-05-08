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
exports.CreateDiagnosisTaskDto = exports.DiagnosisDimensionConfigDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const diagnosis_task_entity_1 = require("../entities/diagnosis-task.entity");
class DiagnosisDimensionConfigDto {
    constructor() {
        this.enabled = true;
    }
}
exports.DiagnosisDimensionConfigDto = DiagnosisDimensionConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '维度名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiagnosisDimensionConfigDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DiagnosisDimensionConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '权重 (0-1)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DiagnosisDimensionConfigDto.prototype, "weight", void 0);
class CreateDiagnosisTaskDto {
}
exports.CreateDiagnosisTaskDto = CreateDiagnosisTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDiagnosisTaskDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌官网URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDiagnosisTaskDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '行业类别' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDiagnosisTaskDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标市场' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDiagnosisTaskDto.prototype, "targetMarket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '诊断类型', enum: diagnosis_task_entity_1.DiagnosisType, default: diagnosis_task_entity_1.DiagnosisType.FULL }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(diagnosis_task_entity_1.DiagnosisType),
    __metadata("design:type", String)
], CreateDiagnosisTaskDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '指定AI引擎' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDiagnosisTaskDto.prototype, "engine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '诊断维度配置', type: [DiagnosisDimensionConfigDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateDiagnosisTaskDto.prototype, "dimensions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否包含竞品分析' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDiagnosisTaskDto.prototype, "includeCompetitorAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '竞品列表', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateDiagnosisTaskDto.prototype, "competitors", void 0);
//# sourceMappingURL=create-diagnosis-task.dto.js.map