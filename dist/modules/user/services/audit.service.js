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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const SensitiveActions = [
    'user:delete',
    'user:reset_password',
    'brand:delete',
    'subscription:upgrade',
    'subscription:cancel',
    'settings:update',
    'role:update',
    'permission:grant',
];
let AuditService = class AuditService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(params) {
        const isSensitive = SensitiveActions.some(a => params.action.startsWith(a.split(':')[0]) &&
            params.action.includes(a.split(':')[1])) || params.action.includes('delete') || params.action.includes('reset');
        const log = this.auditLogRepository.create({
            ...params,
            isSensitive,
            result: params.result || 'success',
        });
        return this.auditLogRepository.save(log);
    }
    async findAll(query) {
        const { page = 1, limit = 50, organizationId, userId, action, resource, startDate, endDate } = query;
        const skip = (page - 1) * limit;
        const queryBuilder = this.auditLogRepository.createQueryBuilder('log')
            .where('1=1');
        if (organizationId) {
            queryBuilder.andWhere('log.organizationId = :organizationId', { organizationId });
        }
        if (userId) {
            queryBuilder.andWhere('log.userId = :userId', { userId });
        }
        if (action) {
            queryBuilder.andWhere('log.action LIKE :action', { action: `%${action}%` });
        }
        if (resource) {
            queryBuilder.andWhere('log.resource = :resource', { resource });
        }
        if (startDate && endDate) {
            queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        }
        const [logs, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('log.createdAt', 'DESC')
            .getManyAndCount();
        return { logs, total };
    }
    async getUserHistory(userId, limit = 20) {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getResourceHistory(resource, resourceId) {
        return this.auditLogRepository.find({
            where: { resource, resourceId },
            order: { createdAt: 'DESC' },
        });
    }
    async getSensitiveStats(organizationId, days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await this.auditLogRepository
            .createQueryBuilder('log')
            .select('log.action', 'action')
            .addSelect('COUNT(*)', 'count')
            .where('log.organizationId = :organizationId', { organizationId })
            .andWhere('log.isSensitive = :isSensitive', { isSensitive: true })
            .andWhere('log.createdAt >= :startDate', { startDate })
            .groupBy('log.action')
            .getRawMany();
        const stats = {};
        result.forEach(row => {
            stats[row.action] = parseInt(row.count, 10);
        });
        return stats;
    }
    async cleanupOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const result = await this.auditLogRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .andWhere('isSensitive = :isSensitive', { isSensitive: false })
            .execute();
        return result.affected || 0;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map