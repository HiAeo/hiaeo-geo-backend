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
exports.DiagnosisReport = exports.ReportGrade = void 0;
const typeorm_1 = require("typeorm");
var ReportGrade;
(function (ReportGrade) {
    ReportGrade["EXCELLENT"] = "excellent";
    ReportGrade["GOOD"] = "good";
    ReportGrade["FAIR"] = "fair";
    ReportGrade["POOR"] = "poor";
    ReportGrade["VERY_POOR"] = "very_poor";
})(ReportGrade || (exports.ReportGrade = ReportGrade = {}));
let DiagnosisReport = class DiagnosisReport {
};
exports.DiagnosisReport = DiagnosisReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id' }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id', nullable: true }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_id', nullable: true }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_name' }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "brandName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], DiagnosisReport.prototype, "overallScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'grade',
        type: 'simple-enum',
        enum: ReportGrade,
        default: ReportGrade.FAIR,
    }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_level', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DiagnosisReport.prototype, "healthLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dimension_scores', type: 'json' }),
    __metadata("design:type", Array)
], DiagnosisReport.prototype, "dimensionScores", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'competitor_analysis', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DiagnosisReport.prototype, "competitorAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], DiagnosisReport.prototype, "issues", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], DiagnosisReport.prototype, "suggestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'executive_summary', type: 'text' }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "executiveSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_insights', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DiagnosisReport.prototype, "aiInsights", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'raw_ai_response', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DiagnosisReport.prototype, "rawAiResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'engines_used', type: 'json', default: '[]' }),
    __metadata("design:type", Array)
], DiagnosisReport.prototype, "enginesUsed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DiagnosisReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DiagnosisReport.prototype, "updatedAt", void 0);
exports.DiagnosisReport = DiagnosisReport = __decorate([
    (0, typeorm_1.Entity)('diagnosis_reports')
], DiagnosisReport);
//# sourceMappingURL=diagnosis-report.entity.js.map