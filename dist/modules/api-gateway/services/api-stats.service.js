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
var ApiStatsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiStatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const api_usage_log_entity_1 = require("../entities/api-usage-log.entity");
const api_key_entity_1 = require("../entities/api-key.entity");
let ApiStatsService = ApiStatsService_1 = class ApiStatsService {
    constructor(usageLogRepository, apiKeyRepository, dataSource) {
        this.usageLogRepository = usageLogRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ApiStatsService_1.name);
    }
    async getUsageStats(apiKeyId, startDate, endDate) {
        const logs = await this.usageLogRepository.find({
            where: {
                apiKeyId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const stats = {
            total: logs.length,
            success: logs.filter(l => l.isSuccess()).length,
            failed: logs.filter(l => !l.isSuccess()).length,
            successRate: 0,
            avgResponseTime: 0,
            byEndpoint: {},
            byDay: [],
        };
        if (stats.total > 0) {
            stats.successRate = (stats.success / stats.total) * 100;
        }
        const responseTimes = logs.map(l => l.responseTime || 0).filter(t => t > 0);
        if (responseTimes.length > 0) {
            stats.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        }
        logs.forEach(log => {
            stats.byEndpoint[log.endpoint] = (stats.byEndpoint[log.endpoint] || 0) + 1;
        });
        const byDayMap = new Map();
        logs.forEach(log => {
            const date = log.createdAt.toISOString().split('T')[0];
            byDayMap.set(date, (byDayMap.get(date) || 0) + 1);
        });
        stats.byDay = Array.from(byDayMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        return stats;
    }
    async getTopApiKeys(limit = 10) {
        const result = await this.dataSource.query(`
      SELECT 
        api_key_id,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(response_time) as avg_response_time,
        MAX(created_at) as last_used_at
      FROM api_usage_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY api_key_id
      ORDER BY total DESC
      LIMIT $1
    `, [limit]);
        const apiKeys = await this.apiKeyRepository.find();
        const apiKeyMap = new Map(apiKeys.map(k => [k.id, k]));
        return result.map((row) => {
            const apiKey = apiKeyMap.get(row.api_key_id);
            const total = parseInt(row.total);
            const monthlyLimit = apiKey?.monthlyLimit || 10000;
            return {
                apiKeyId: row.api_key_id,
                apiKeyName: apiKey?.name || 'Unknown',
                totalRequests: total,
                successRequests: parseInt(row.success),
                failedRequests: parseInt(row.failed),
                avgResponseTime: parseFloat(row.avg_response_time) || 0,
                lastUsedAt: row.last_used_at,
                remainingQuota: Math.max(0, monthlyLimit - total),
                usagePercentage: (total / monthlyLimit) * 100,
            };
        });
    }
    async getHealthStatus() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [logs, activeKeys, totalRequests] = await Promise.all([
            this.usageLogRepository.find({
                where: { createdAt: (0, typeorm_2.MoreThan)(oneDayAgo) },
            }),
            this.apiKeyRepository.count({ where: { status: 'active' } }),
            this.usageLogRepository.count({ where: { createdAt: (0, typeorm_2.MoreThan)(oneDayAgo) } }),
        ]);
        const successRate = logs.length > 0
            ? (logs.filter(l => l.isSuccess()).length / logs.length) * 100
            : 100;
        const responseTimes = logs.map(l => l.responseTime || 0).filter(t => t > 0);
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;
        let overall = 'healthy';
        if (successRate < 90 || avgResponseTime > 2000) {
            overall = 'degraded';
        }
        if (successRate < 50 || avgResponseTime > 5000) {
            overall = 'down';
        }
        return {
            overall,
            successRate: Math.round(successRate * 100) / 100,
            avgResponseTime: Math.round(avgResponseTime),
            activeKeys,
            requestsLast24h: totalRequests,
        };
    }
    async cleanupOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const result = await this.usageLogRepository.delete({
            createdAt: (0, typeorm_2.LessThan)(cutoffDate),
        });
        this.logger.log(`清理了 ${result.affected} 条过期日志`);
        return result.affected || 0;
    }
};
exports.ApiStatsService = ApiStatsService;
exports.ApiStatsService = ApiStatsService = ApiStatsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_usage_log_entity_1.ApiUsageLog)),
    __param(1, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ApiStatsService);
//# sourceMappingURL=api-stats.service.js.map