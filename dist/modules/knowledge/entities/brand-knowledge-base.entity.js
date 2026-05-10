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
exports.BrandKnowledgeBase = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../../user/entities/organization.entity");
let BrandKnowledgeBase = class BrandKnowledgeBase {
};
exports.BrandKnowledgeBase = BrandKnowledgeBase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BrandKnowledgeBase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BrandKnowledgeBase.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => organization_entity_1.Organization, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'organizationId' }),
    __metadata("design:type", organization_entity_1.Organization)
], BrandKnowledgeBase.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BrandKnowledgeBase.prototype, "basicInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BrandKnowledgeBase.prototype, "bizPositioning", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BrandKnowledgeBase.prototype, "productService", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BrandKnowledgeBase.prototype, "competitorMarket", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BrandKnowledgeBase.prototype, "geoGoals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BrandKnowledgeBase.prototype, "fileIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BrandKnowledgeBase.prototype, "supplement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], BrandKnowledgeBase.prototype, "lastDiagnosisScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], BrandKnowledgeBase.prototype, "lastDiagnosisGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], BrandKnowledgeBase.prototype, "lastDiagnosisReportId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], BrandKnowledgeBase.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], BrandKnowledgeBase.prototype, "lastDiagnosisRefresh", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BrandKnowledgeBase.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BrandKnowledgeBase.prototype, "updatedAt", void 0);
exports.BrandKnowledgeBase = BrandKnowledgeBase = __decorate([
    (0, typeorm_1.Entity)('brand_knowledge_base')
], BrandKnowledgeBase);
//# sourceMappingURL=brand-knowledge-base.entity.js.map