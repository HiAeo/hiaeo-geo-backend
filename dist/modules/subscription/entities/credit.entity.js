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
exports.CreditTransaction = exports.Credit = exports.SourceType = exports.TransactionStatus = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
var TransactionType;
(function (TransactionType) {
    TransactionType["EARN"] = "earn";
    TransactionType["CONSUME"] = "consume";
    TransactionType["REFUND"] = "refund";
    TransactionType["BONUS"] = "bonus";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var SourceType;
(function (SourceType) {
    SourceType["PURCHASE"] = "purchase";
    SourceType["SUBSCRIPTION"] = "subscription";
    SourceType["REFERRAL"] = "referral";
    SourceType["BONUS"] = "bonus";
    SourceType["DAILY"] = "daily";
    SourceType["DIAGNOSTIC"] = "diagnostic";
    SourceType["CONTENT_GENERATION"] = "content_generation";
})(SourceType || (exports.SourceType = SourceType = {}));
let Credit = class Credit {
};
exports.Credit = Credit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Credit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Credit.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Credit.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_earned', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Credit.prototype, "totalEarned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_consumed', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Credit.prototype, "totalConsumed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Credit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Credit.prototype, "updatedAt", void 0);
exports.Credit = Credit = __decorate([
    (0, typeorm_1.Entity)('credits')
], Credit);
let CreditTransaction = class CreditTransaction {
};
exports.CreditTransaction = CreditTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CreditTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], CreditTransaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: TransactionType,
        default: TransactionType.EARN,
    }),
    __metadata("design:type", String)
], CreditTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'source_type',
        type: 'simple-enum',
        enum: SourceType,
    }),
    __metadata("design:type", String)
], CreditTransaction.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CreditTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: TransactionStatus,
        default: TransactionStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], CreditTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_before', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CreditTransaction.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_after', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CreditTransaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CreditTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_order_id', nullable: true }),
    __metadata("design:type", String)
], CreditTransaction.prototype, "relatedOrderId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CreditTransaction.prototype, "createdAt", void 0);
exports.CreditTransaction = CreditTransaction = __decorate([
    (0, typeorm_1.Entity)('credit_transactions')
], CreditTransaction);
//# sourceMappingURL=credit.entity.js.map