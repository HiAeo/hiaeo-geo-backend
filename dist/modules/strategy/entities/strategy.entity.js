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
exports.Strategy = exports.StrategyType = exports.StrategyStatus = void 0;
const typeorm_1 = require("typeorm");
var StrategyStatus;
(function (StrategyStatus) {
    StrategyStatus["DRAFT"] = "draft";
    StrategyStatus["ACTIVE"] = "active";
    StrategyStatus["COMPLETED"] = "completed";
    StrategyStatus["FAILED"] = "failed";
})(StrategyStatus || (exports.StrategyStatus = StrategyStatus = {}));
var StrategyType;
(function (StrategyType) {
    StrategyType["CONTENT"] = "content";
    StrategyType["SEO"] = "seo";
    StrategyType["SOCIAL"] = "social";
    StrategyType["MOFA"] = "mofa";
    StrategyType["HYBRID"] = "hybrid";
})(StrategyType || (exports.StrategyType = StrategyType = {}));
let Strategy = class Strategy {
};
exports.Strategy = Strategy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Strategy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_id' }),
    __metadata("design:type", String)
], Strategy.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Strategy.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Strategy.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: StrategyType,
        default: StrategyType.CONTENT,
    }),
    __metadata("design:type", String)
], Strategy.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: StrategyStatus,
        default: StrategyStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Strategy.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], Strategy.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diagnosis_report_id', nullable: true }),
    __metadata("design:type", String)
], Strategy.prototype, "diagnosisReportId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Strategy.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_keywords', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Strategy.prototype, "targetKeywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_channels', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Strategy.prototype, "targetChannels", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_progress', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Strategy.prototype, "executionProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Strategy.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Strategy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Strategy.prototype, "updatedAt", void 0);
exports.Strategy = Strategy = __decorate([
    (0, typeorm_1.Entity)('strategies'),
    (0, typeorm_1.Index)(['brandId']),
    (0, typeorm_1.Index)(['status'])
], Strategy);
//# sourceMappingURL=strategy.entity.js.map