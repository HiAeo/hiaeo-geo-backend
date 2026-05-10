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
exports.EnterpriseTransfer = exports.TransferStatus = void 0;
const typeorm_1 = require("typeorm");
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pending";
    TransferStatus["VERIFYING"] = "verifying";
    TransferStatus["CONFIRMED"] = "confirmed";
    TransferStatus["REJECTED"] = "rejected";
    TransferStatus["CANCELLED"] = "cancelled";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
let EnterpriseTransfer = class EnterpriseTransfer {
};
exports.EnterpriseTransfer = EnterpriseTransfer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "transferNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: TransferStatus, default: TransferStatus.PENDING }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], EnterpriseTransfer.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "payerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "payerAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "payerBank", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '杭州魔鲸科技有限公司' }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "payeeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: '91330100MA2HXXXXXR' }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "payeeTaxNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "payeeBank", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "payeeAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "voucherUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "transferTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "serialNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: TransferStatus, default: TransferStatus.PENDING }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "verifiedStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], EnterpriseTransfer.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "verifyRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "rechargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EnterpriseTransfer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EnterpriseTransfer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], EnterpriseTransfer.prototype, "createdBy", void 0);
exports.EnterpriseTransfer = EnterpriseTransfer = __decorate([
    (0, typeorm_1.Entity)('enterprise_transfers'),
    (0, typeorm_1.Index)(['organizationId', 'status']),
    (0, typeorm_1.Index)(['transferNo'])
], EnterpriseTransfer);
//# sourceMappingURL=enterprise-transfer.entity.js.map