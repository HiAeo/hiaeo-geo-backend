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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../entities/notification.entity");
const notification_preference_entity_1 = require("../entities/notification-preference.entity");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, preferenceRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async send(params) {
        const channels = params.channels || [notification_entity_1.NotificationChannel.IN_APP];
        const notifications = [];
        for (const channel of channels) {
            const notification = this.notificationRepository.create({
                organizationId: params.organizationId,
                userId: params.userId,
                userName: params.userName,
                title: params.title,
                content: params.content,
                type: params.type,
                channels: [channel],
                status: notification_entity_1.NotificationStatus.PENDING,
                data: params.data,
                actionUrl: params.actionUrl,
                actionText: params.actionText,
            });
            notifications.push(await this.notificationRepository.save(notification));
        }
        for (const notification of notifications) {
            this.sendChannelNotification(notification).catch(err => {
                this.logger.error(`Failed to send notification ${notification.id}`, err);
            });
        }
        return notifications;
    }
    async sendEmail(notification) {
        this.logger.log(`[Email] Sending to ${notification.userName}: ${notification.title}`);
        notification.status = notification_entity_1.NotificationStatus.SENT;
        notification.sentAt = new Date();
        await this.notificationRepository.save(notification);
    }
    async sendSMS(notification) {
        this.logger.log(`[SMS] Sending to ${notification.userName}: ${notification.title}`);
        notification.status = notification_entity_1.NotificationStatus.SENT;
        notification.sentAt = new Date();
        await this.notificationRepository.save(notification);
    }
    async sendInApp(notification) {
        notification.status = notification_entity_1.NotificationStatus.SENT;
        notification.sentAt = new Date();
        await this.notificationRepository.save(notification);
    }
    async sendChannelNotification(notification) {
        const channel = notification.channels[0];
        switch (channel) {
            case notification_entity_1.NotificationChannel.EMAIL:
                await this.sendEmail(notification);
                break;
            case notification_entity_1.NotificationChannel.SMS:
                await this.sendSMS(notification);
                break;
            case notification_entity_1.NotificationChannel.IN_APP:
                await this.sendInApp(notification);
                break;
        }
    }
    async findAll(userId, options) {
        const { type, status, unreadOnly, page = 1, limit = 20 } = options || {};
        const skip = (page - 1) * limit;
        const queryBuilder = this.notificationRepository.createQueryBuilder('n')
            .where('n.userId = :userId', { userId });
        if (type) {
            queryBuilder.andWhere('n.type = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('n.status = :status', { status });
        }
        if (unreadOnly) {
            queryBuilder.andWhere('n.status != :readStatus', { readStatus: notification_entity_1.NotificationStatus.READ });
        }
        const [notifications, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('n.createdAt', 'DESC')
            .getManyAndCount();
        const unreadCount = await this.notificationRepository.count({
            where: { userId, status: notification_entity_1.NotificationStatus.SENT },
        });
        return { notifications, total, unreadCount };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (notification) {
            notification.markAsRead();
            await this.notificationRepository.save(notification);
        }
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ userId, status: notification_entity_1.NotificationStatus.SENT }, { status: notification_entity_1.NotificationStatus.READ, readAt: new Date() });
    }
    async delete(notificationId, userId) {
        await this.notificationRepository.delete({ id: notificationId, userId });
    }
    async getPreferences(userId) {
        let preference = await this.preferenceRepository.findOne({ where: { userId } });
        if (!preference) {
            preference = this.preferenceRepository.create({ userId });
            await this.preferenceRepository.save(preference);
        }
        return preference;
    }
    async updatePreferences(userId, updates) {
        let preference = await this.preferenceRepository.findOne({ where: { userId } });
        if (!preference) {
            preference = this.preferenceRepository.create({ userId, ...updates });
        }
        else {
            Object.assign(preference, updates);
        }
        return this.preferenceRepository.save(preference);
    }
    async sendBulk(params) {
        let sentCount = 0;
        for (const userId of params.userIds) {
            await this.send({
                organizationId: 'system',
                userId,
                userName: 'System',
                title: params.title,
                content: params.content,
                type: params.type,
                channels: params.channels,
            });
            sentCount++;
        }
        return sentCount;
    }
    async cleanup(daysToKeep = 30) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const result = await this.notificationRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .andWhere('status = :status', { status: notification_entity_1.NotificationStatus.READ })
            .execute();
        return result.affected || 0;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map