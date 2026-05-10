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
exports.Subscription = exports.SubscriptionStatus = void 0;
const typeorm_1 = require("typeorm");
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["SUSPENDED"] = "suspended";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
let Subscription = class Subscription {
};
exports.Subscription = Subscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Subscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Subscription.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_id', nullable: true }),
    __metadata("design:type", String)
], Subscription.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'package_id' }),
    __metadata("design:type", String)
], Subscription.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id', nullable: true }),
    __metadata("design:type", String)
], Subscription.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], Subscription.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], Subscription.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diagnosis_used', default: 0 }),
    __metadata("design:type", Number)
], Subscription.prototype, "diagnosisUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diagnosis_limit', default: 10 }),
    __metadata("design:type", Number)
], Subscription.prototype, "diagnosisLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits', default: 0 }),
    __metadata("design:type", Number)
], Subscription.prototype, "credits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits_limit', default: 0 }),
    __metadata("design:type", Number)
], Subscription.prototype, "creditsLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_renew', default: true }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "autoRenew", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Subscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Subscription.prototype, "updatedAt", void 0);
exports.Subscription = Subscription = __decorate([
    (0, typeorm_1.Entity)('subscriptions')
], Subscription);
//# sourceMappingURL=subscription.entity.js.map