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
exports.ContentAudit = exports.MofaStrategy = exports.PublishRecord = exports.Content = void 0;
const typeorm_1 = require("typeorm");
let Content = class Content {
};
exports.Content = Content;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Content.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Content.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Content.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_type', length: 50 }),
    __metadata("design:type", String)
], Content.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], Content.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', length: 100 }),
    __metadata("design:type", String)
], Content.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], Content.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'draft' }),
    __metadata("design:type", String)
], Content.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Content.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Content.prototype, "updatedAt", void 0);
exports.Content = Content = __decorate([
    (0, typeorm_1.Entity)('contents')
], Content);
let PublishRecord = class PublishRecord {
};
exports.PublishRecord = PublishRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PublishRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_id', length: 100 }),
    __metadata("design:type", String)
], PublishRecord.prototype, "contentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Content),
    (0, typeorm_1.JoinColumn)({ name: 'content_id' }),
    __metadata("design:type", Content)
], PublishRecord.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], PublishRecord.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', length: 100 }),
    __metadata("design:type", String)
], PublishRecord.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], PublishRecord.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_content_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], PublishRecord.prototype, "platformContentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], PublishRecord.prototype, "platformUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'pending' }),
    __metadata("design:type", String)
], PublishRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], PublishRecord.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'published_at', nullable: true }),
    __metadata("design:type", Date)
], PublishRecord.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_time', nullable: true }),
    __metadata("design:type", Date)
], PublishRecord.prototype, "scheduledTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PublishRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PublishRecord.prototype, "updatedAt", void 0);
exports.PublishRecord = PublishRecord = __decorate([
    (0, typeorm_1.Entity)('publish_records')
], PublishRecord);
let MofaStrategy = class MofaStrategy {
};
exports.MofaStrategy = MofaStrategy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MofaStrategy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], MofaStrategy.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'strategy_type', length: 50 }),
    __metadata("design:type", String)
], MofaStrategy.prototype, "strategyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], MofaStrategy.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', length: 100 }),
    __metadata("design:type", String)
], MofaStrategy.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], MofaStrategy.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'draft' }),
    __metadata("design:type", String)
], MofaStrategy.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MofaStrategy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MofaStrategy.prototype, "updatedAt", void 0);
exports.MofaStrategy = MofaStrategy = __decorate([
    (0, typeorm_1.Entity)('mofa_strategies')
], MofaStrategy);
let ContentAudit = class ContentAudit {
};
exports.ContentAudit = ContentAudit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ContentAudit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_id', length: 100 }),
    __metadata("design:type", String)
], ContentAudit.prototype, "contentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', length: 100 }),
    __metadata("design:type", String)
], ContentAudit.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], ContentAudit.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ContentAudit.prototype, "changes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ContentAudit.prototype, "createdAt", void 0);
exports.ContentAudit = ContentAudit = __decorate([
    (0, typeorm_1.Entity)('content_audits')
], ContentAudit);
//# sourceMappingURL=index.js.map