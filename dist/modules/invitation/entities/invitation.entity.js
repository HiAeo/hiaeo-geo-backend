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
exports.Invitation = exports.InvitationStatus = void 0;
const typeorm_1 = require("typeorm");
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "pending";
    InvitationStatus["COMPLETED"] = "completed";
    InvitationStatus["EXPIRED"] = "expired";
    InvitationStatus["CANCELLED"] = "cancelled";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
let Invitation = class Invitation {
};
exports.Invitation = Invitation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Invitation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inviter_id' }),
    __metadata("design:type", String)
], Invitation.prototype, "inviterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invitee_id', nullable: true }),
    __metadata("design:type", String)
], Invitation.prototype, "inviteeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Invitation.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Invitation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reward_credits', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Invitation.prototype, "rewardCredits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reward_discount', type: 'real', default: 0 }),
    __metadata("design:type", Number)
], Invitation.prototype, "rewardDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referral_order_id', nullable: true }),
    __metadata("design:type", String)
], Invitation.prototype, "referralOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invited_at', nullable: true }),
    __metadata("design:type", Date)
], Invitation.prototype, "invitedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], Invitation.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    __metadata("design:type", Date)
], Invitation.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Invitation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Invitation.prototype, "updatedAt", void 0);
exports.Invitation = Invitation = __decorate([
    (0, typeorm_1.Entity)('invitations'),
    (0, typeorm_1.Index)(['inviterId']),
    (0, typeorm_1.Index)(['inviteeId']),
    (0, typeorm_1.Index)(['code'])
], Invitation);
//# sourceMappingURL=invitation.entity.js.map