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
exports.Package = exports.PackageStatus = exports.BillingCycle = exports.PackageType = void 0;
const typeorm_1 = require("typeorm");
var PackageType;
(function (PackageType) {
    PackageType["BASIC"] = "basic";
    PackageType["PROFESSIONAL"] = "professional";
    PackageType["ENTERPRISE"] = "enterprise";
    PackageType["TRIAL"] = "trial";
})(PackageType || (exports.PackageType = PackageType = {}));
var BillingCycle;
(function (BillingCycle) {
    BillingCycle["MONTHLY"] = "monthly";
    BillingCycle["QUARTERLY"] = "quarterly";
    BillingCycle["YEARLY"] = "yearly";
})(BillingCycle || (exports.BillingCycle = BillingCycle = {}));
var PackageStatus;
(function (PackageStatus) {
    PackageStatus["ACTIVE"] = "active";
    PackageStatus["INACTIVE"] = "inactive";
    PackageStatus["ARCHIVED"] = "archived";
})(PackageStatus || (exports.PackageStatus = PackageStatus = {}));
let Package = class Package {
    getFeaturesList() {
        try {
            return JSON.parse(this.features || '[]');
        }
        catch {
            return [];
        }
    }
    getPriceForCycle(cycle) {
        if (this.billingCycle === cycle) {
            return Number(this.price);
        }
        const cycles = typeof this.billingCycles === 'string'
            ? JSON.parse(this.billingCycles)
            : this.billingCycles;
        const cycleConfig = cycles?.find((c) => c.cycle === cycle);
        return cycleConfig?.price || Number(this.price);
    }
};
exports.Package = Package;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Package.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Package.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_name' }),
    __metadata("design:type", String)
], Package.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Package.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Package.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: PackageType, default: PackageType.BASIC }),
    __metadata("design:type", String)
], Package.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Package.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Package.prototype, "originalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_cycle', type: 'simple-enum', enum: BillingCycle, default: BillingCycle.MONTHLY }),
    __metadata("design:type", String)
], Package.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_cycles', type: 'json', default: '[]' }),
    __metadata("design:type", Array)
], Package.prototype, "billingCycles", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diagnosis_limit', default: 10 }),
    __metadata("design:type", Number)
], Package.prototype, "diagnosisLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'report_limit', default: 5 }),
    __metadata("design:type", Number)
], Package.prototype, "reportLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_engine_limit', default: 1 }),
    __metadata("design:type", Number)
], Package.prototype, "aiEngineLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_limit', default: 100 }),
    __metadata("design:type", Number)
], Package.prototype, "contentLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_limit', default: 1 }),
    __metadata("design:type", Number)
], Package.prototype, "brandLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_member_limit', default: 1 }),
    __metadata("design:type", Number)
], Package.prototype, "teamMemberLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'api_access', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "apiAccess", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority_support', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "prioritySupport", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'custom_branding', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "customBranding", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: PackageStatus, default: PackageStatus.ACTIVE }),
    __metadata("design:type", String)
], Package.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_trial', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "isTrial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trial_days', default: 0 }),
    __metadata("design:type", Number)
], Package.prototype, "trialDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_recommended', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Package.prototype, "isRecommended", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], Package.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Package.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Package.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], Package.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Package.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Package.prototype, "updatedAt", void 0);
exports.Package = Package = __decorate([
    (0, typeorm_1.Entity)('packages')
], Package);
//# sourceMappingURL=package.entity.js.map