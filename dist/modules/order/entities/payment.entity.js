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
exports.Refund = exports.Payment = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["SUCCESS"] = "success";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["PARTIAL_REFUND"] = "partial_refund";
    PaymentStatus["EXPIRED"] = "expired";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", String)
], Payment.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_no', unique: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentNo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'simple-enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refunded_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "refundedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'channel_transaction_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "channelTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_at', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expire_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "expireAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'channel_response', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "channelResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
let Refund = class Refund {
};
exports.Refund = Refund;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Refund.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", String)
], Refund.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_id' }),
    __metadata("design:type", String)
], Refund.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refund_no', unique: true }),
    __metadata("design:type", String)
], Refund.prototype, "refundNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Refund.prototype, "refundAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reason' }),
    __metadata("design:type", String)
], Refund.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_id', nullable: true }),
    __metadata("design:type", String)
], Refund.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status' }),
    __metadata("design:type", String)
], Refund.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'channel_refund_id', nullable: true }),
    __metadata("design:type", String)
], Refund.prototype, "channelRefundId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', nullable: true }),
    __metadata("design:type", Date)
], Refund.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Refund.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Refund.prototype, "updatedAt", void 0);
exports.Refund = Refund = __decorate([
    (0, typeorm_1.Entity)('refunds')
], Refund);
//# sourceMappingURL=payment.entity.js.map