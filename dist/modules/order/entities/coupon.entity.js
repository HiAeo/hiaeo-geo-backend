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
exports.UserCoupon = exports.Coupon = exports.CouponStatus = exports.CouponType = void 0;
const typeorm_1 = require("typeorm");
var CouponType;
(function (CouponType) {
    CouponType["PERCENTAGE"] = "percentage";
    CouponType["FIXED"] = "fixed";
})(CouponType || (exports.CouponType = CouponType = {}));
var CouponStatus;
(function (CouponStatus) {
    CouponStatus["ACTIVE"] = "active";
    CouponStatus["INACTIVE"] = "inactive";
    CouponStatus["EXPIRED"] = "expired";
})(CouponStatus || (exports.CouponStatus = CouponStatus = {}));
let Coupon = class Coupon {
};
exports.Coupon = Coupon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Coupon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Coupon.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Coupon.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Coupon.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: CouponType }),
    __metadata("design:type", String)
], Coupon.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Coupon.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "minAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_discount', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Coupon.prototype, "maxDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "totalCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "usedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'per_user_limit', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Coupon.prototype, "perUserLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], Coupon.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], Coupon.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicable_packages', type: 'json', default: '[]' }),
    __metadata("design:type", Array)
], Coupon.prototype, "applicablePackages", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_first_order', default: false }),
    __metadata("design:type", Boolean)
], Coupon.prototype, "isFirstOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: CouponStatus,
        default: CouponStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Coupon.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Coupon.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Coupon.prototype, "updatedAt", void 0);
exports.Coupon = Coupon = __decorate([
    (0, typeorm_1.Entity)('coupons')
], Coupon);
let UserCoupon = class UserCoupon {
};
exports.UserCoupon = UserCoupon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserCoupon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserCoupon.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coupon_id' }),
    __metadata("design:type", String)
], UserCoupon.prototype, "couponId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id', nullable: true }),
    __metadata("design:type", String)
], UserCoupon.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserCoupon.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_at', nullable: true }),
    __metadata("design:type", Date)
], UserCoupon.prototype, "usedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserCoupon.prototype, "createdAt", void 0);
exports.UserCoupon = UserCoupon = __decorate([
    (0, typeorm_1.Entity)('user_coupons')
], UserCoupon);
//# sourceMappingURL=coupon.entity.js.map