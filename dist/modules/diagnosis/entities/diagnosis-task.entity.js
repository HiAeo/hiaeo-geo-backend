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
exports.DiagnosisTask = exports.DiagnosisType = exports.DiagnosisStatus = void 0;
const typeorm_1 = require("typeorm");
var DiagnosisStatus;
(function (DiagnosisStatus) {
    DiagnosisStatus["PENDING"] = "pending";
    DiagnosisStatus["RUNNING"] = "running";
    DiagnosisStatus["COMPLETED"] = "completed";
    DiagnosisStatus["FAILED"] = "failed";
    DiagnosisStatus["CANCELLED"] = "cancelled";
})(DiagnosisStatus || (exports.DiagnosisStatus = DiagnosisStatus = {}));
var DiagnosisType;
(function (DiagnosisType) {
    DiagnosisType["FULL"] = "full";
    DiagnosisType["QUICK"] = "quick";
    DiagnosisType["COMPETITOR"] = "competitor";
    DiagnosisType["TRACKING"] = "tracking";
})(DiagnosisType || (exports.DiagnosisType = DiagnosisType = {}));
let DiagnosisTask = class DiagnosisTask {
};
exports.DiagnosisTask = DiagnosisTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id', nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_id', nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_name' }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "brandName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'industry', nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_market', nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "targetMarket", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: DiagnosisType,
        default: DiagnosisType.FULL,
    }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: DiagnosisStatus,
        default: DiagnosisStatus.PENDING,
    }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_engine', nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "aiEngine", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress', default: 0 }),
    __metadata("design:type", Number)
], DiagnosisTask.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DiagnosisTask.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'report_id', nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "reportId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', nullable: true }),
    __metadata("design:type", String)
], DiagnosisTask.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', nullable: true }),
    __metadata("design:type", Date)
], DiagnosisTask.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], DiagnosisTask.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DiagnosisTask.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DiagnosisTask.prototype, "updatedAt", void 0);
exports.DiagnosisTask = DiagnosisTask = __decorate([
    (0, typeorm_1.Entity)('diagnosis_tasks')
], DiagnosisTask);
//# sourceMappingURL=diagnosis-task.entity.js.map