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
exports.QueryDiagnosisTaskDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const diagnosis_task_entity_1 = require("../entities/diagnosis-task.entity");
class QueryDiagnosisTaskDto {
    constructor() {
        this.page = 1;
        this.pageSize = 10;
    }
}
exports.QueryDiagnosisTaskDto = QueryDiagnosisTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '用户ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDiagnosisTaskDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '诊断状态', enum: diagnosis_task_entity_1.DiagnosisStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(diagnosis_task_entity_1.DiagnosisStatus),
    __metadata("design:type", String)
], QueryDiagnosisTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '诊断类型', enum: diagnosis_task_entity_1.DiagnosisType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(diagnosis_task_entity_1.DiagnosisType),
    __metadata("design:type", String)
], QueryDiagnosisTaskDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '品牌名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDiagnosisTaskDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDiagnosisTaskDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDiagnosisTaskDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryDiagnosisTaskDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryDiagnosisTaskDto.prototype, "pageSize", void 0);
//# sourceMappingURL=query-diagnosis.dto.js.map