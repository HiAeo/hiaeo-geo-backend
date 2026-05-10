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
exports.NotificationPreference = void 0;
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
let NotificationPreference = class NotificationPreference {
    isQuietHours() {
        if (!this.quietHoursEnabled)
            return false;
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        if (this.quietHoursStart > this.quietHoursEnd) {
            return currentTime >= this.quietHoursStart || currentTime <= this.quietHoursEnd;
        }
        return currentTime >= this.quietHoursStart && currentTime <= this.quietHoursEnd;
    }
    isTypeAllowed(type, channel) {
        if (channel === notification_entity_1.NotificationChannel.IN_APP)
            return true;
        if (channel === notification_entity_1.NotificationChannel.EMAIL) {
            if (!this.emailEnabled)
                return false;
            if (this.emailTypes && !this.emailTypes.includes(type))
                return false;
        }
        if (channel === notification_entity_1.NotificationChannel.SMS) {
            if (!this.smsEnabled)
                return false;
            if (this.smsTypes && !this.smsTypes.includes(type))
                return false;
        }
        if (type === 'marketing' && !this.marketingEnabled)
            return false;
        return true;
    }
};
exports.NotificationPreference = NotificationPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], NotificationPreference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "emailEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], NotificationPreference.prototype, "emailTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "smsEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], NotificationPreference.prototype, "smsTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: '22:00' }),
    __metadata("design:type", String)
], NotificationPreference.prototype, "quietHoursStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: '08:00' }),
    __metadata("design:type", String)
], NotificationPreference.prototype, "quietHoursEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "quietHoursEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "marketingEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ['realtime', 'hourly', 'daily'], default: 'realtime' }),
    __metadata("design:type", String)
], NotificationPreference.prototype, "aggregationMode", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationPreference.prototype, "updatedAt", void 0);
exports.NotificationPreference = NotificationPreference = __decorate([
    (0, typeorm_1.Entity)('notification_preferences')
], NotificationPreference);
//# sourceMappingURL=notification-preference.entity.js.map