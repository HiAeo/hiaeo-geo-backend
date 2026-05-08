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
exports.DiagnosisProgressDto = exports.DiagnosisReportResponseDto = exports.DiagnosisTaskResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const diagnosis_task_entity_1 = require("../entities/diagnosis-task.entity");
const diagnosis_report_entity_1 = require("../entities/diagnosis-report.entity");
class DiagnosisTaskResponseDto {
}
exports.DiagnosisTaskResponseDto = DiagnosisTaskResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: diagnosis_task_entity_1.DiagnosisStatus }),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DiagnosisTaskResponseDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "reportId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DiagnosisTaskResponseDto.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], DiagnosisTaskResponseDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], DiagnosisTaskResponseDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], DiagnosisTaskResponseDto.prototype, "createdAt", void 0);
class DiagnosisReportResponseDto {
}
exports.DiagnosisReportResponseDto = DiagnosisReportResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisReportResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisReportResponseDto.prototype, "taskId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisReportResponseDto.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DiagnosisReportResponseDto.prototype, "overallScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: diagnosis_report_entity_1.ReportGrade }),
    __metadata("design:type", String)
], DiagnosisReportResponseDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DiagnosisReportResponseDto.prototype, "healthLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], DiagnosisReportResponseDto.prototype, "dimensionScores", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], DiagnosisReportResponseDto.prototype, "competitorAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], DiagnosisReportResponseDto.prototype, "issues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], DiagnosisReportResponseDto.prototype, "suggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisReportResponseDto.prototype, "executiveSummary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DiagnosisReportResponseDto.prototype, "aiInsights", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], DiagnosisReportResponseDto.prototype, "createdAt", void 0);
class DiagnosisProgressDto {
}
exports.DiagnosisProgressDto = DiagnosisProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisProgressDto.prototype, "taskId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DiagnosisProgressDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DiagnosisProgressDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DiagnosisProgressDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], DiagnosisProgressDto.prototype, "currentStep", void 0);
//# sourceMappingURL=diagnosis-response.dto.js.map