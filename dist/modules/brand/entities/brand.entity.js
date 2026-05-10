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
exports.Brand = exports.BrandStatus = exports.BrandIndustry = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const organization_entity_1 = require("../../user/entities/organization.entity");
var BrandIndustry;
(function (BrandIndustry) {
    BrandIndustry["TECHNOLOGY"] = "technology";
    BrandIndustry["ECOMMERCE"] = "ecommerce";
    BrandIndustry["EDUCATION"] = "education";
    BrandIndustry["HEALTHCARE"] = "healthcare";
    BrandIndustry["FINANCE"] = "finance";
    BrandIndustry["FOOD"] = "food";
    BrandIndustry["TRAVEL"] = "travel";
    BrandIndustry["ENTERTAINMENT"] = "entertainment";
    BrandIndustry["REAL_ESTATE"] = "real_estate";
    BrandIndustry["AUTOMOTIVE"] = "automotive";
    BrandIndustry["FASHION"] = "fashion";
    BrandIndustry["SPORTS"] = "sports";
    BrandIndustry["OTHER"] = "other";
})(BrandIndustry || (exports.BrandIndustry = BrandIndustry = {}));
var BrandStatus;
(function (BrandStatus) {
    BrandStatus["ACTIVE"] = "active";
    BrandStatus["INACTIVE"] = "inactive";
    BrandStatus["PENDING"] = "pending";
    BrandStatus["ARCHIVED"] = "archived";
})(BrandStatus || (exports.BrandStatus = BrandStatus = {}));
let Brand = class Brand {
};
exports.Brand = Brand;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Brand.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Brand.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Brand.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: BrandIndustry, default: BrandIndustry.OTHER }),
    __metadata("design:type", String)
], Brand.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: BrandStatus, default: BrandStatus.ACTIVE }),
    __metadata("design:type", String)
], Brand.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Brand.prototype, "seoData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Brand.prototype, "contactInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Brand.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Brand.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Brand.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'organizationId' }),
    __metadata("design:type", organization_entity_1.Organization)
], Brand.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Brand.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Brand.prototype, "updatedAt", void 0);
exports.Brand = Brand = __decorate([
    (0, typeorm_1.Entity)('brands')
], Brand);
//# sourceMappingURL=brand.entity.js.map