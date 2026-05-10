import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between, DataSource, LessThan } from 'typeorm';
import { ApiUsageLog } from '../entities/api-usage-log.entity';
import { ApiKey } from '../entities/api-key.entity';

export interface UsageStats {
  total: number;
  success: number;
  failed: number;
  successRate: number;
  avgResponseTime: number;
  byEndpoint: Record<string, number>;
  byDay: Array<{ date: string; count: number }>;
}

export interface ApiKeyUsageStats {
  apiKeyId: string;
  apiKeyName: string;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  lastUsedAt: Date;
  remainingQuota: number;
  usagePercentage: number;
}

@Injectable()
export class ApiStatsService {
  private readonly logger = new Logger(ApiStatsService.name);

  constructor(
    @InjectRepository(ApiUsageLog)
    private usageLogRepository: Repository<ApiUsageLog>,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取API使用统计
   */
  async getUsageStats(
    apiKeyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UsageStats> {
    const logs = await this.usageLogRepository.find({
      where: {
        apiKeyId,
        createdAt: Between(startDate, endDate),
      },
    });

    const stats: UsageStats = {
      total: logs.length,
      success: logs.filter(l => l.isSuccess()).length,
      failed: logs.filter(l => !l.isSuccess()).length,
      successRate: 0,
      avgResponseTime: 0,
      byEndpoint: {},
      byDay: [],
    };

    // 计算成功率
    if (stats.total > 0) {
      stats.successRate = (stats.success / stats.total) * 100;
    }

    // 计算平均响应时间
    const responseTimes = logs.map(l => l.responseTime || 0).filter(t => t > 0);
    if (responseTimes.length > 0) {
      stats.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // 按端点统计
    logs.forEach(log => {
      stats.byEndpoint[log.endpoint] = (stats.byEndpoint[log.endpoint] || 0) + 1;
    });

    // 按日期统计
    const byDayMap = new Map<string, number>();
    logs.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0];
      byDayMap.set(date, (byDayMap.get(date) || 0) + 1);
    });
    stats.byDay = Array.from(byDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  }

  /**
   * 获取API Key使用排行
   */
  async getTopApiKeys(limit = 10): Promise<ApiKeyUsageStats[]> {
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

    return result.map((row: any) => {
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

  /**
   * 获取API健康状态
   */
  async getHealthStatus(): Promise<{
    overall: 'healthy' | 'degraded' | 'down';
    successRate: number;
    avgResponseTime: number;
    activeKeys: number;
    requestsLast24h: number;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [logs, activeKeys, totalRequests] = await Promise.all([
      this.usageLogRepository.find({
        where: { createdAt: MoreThan(oneDayAgo) },
      }),
      this.apiKeyRepository.count({ where: { status: 'active' as any } }),
      this.usageLogRepository.count({ where: { createdAt: MoreThan(oneDayAgo) } }),
    ]);

    const successRate = logs.length > 0
      ? (logs.filter(l => l.isSuccess()).length / logs.length) * 100
      : 100;

    const responseTimes = logs.map(l => l.responseTime || 0).filter(t => t > 0);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    let overall: 'healthy' | 'degraded' | 'down' = 'healthy';
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

  /**
   * 清理过期日志
   */
  async cleanupOldLogs(daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await this.usageLogRepository.delete({
      createdAt: LessThan(cutoffDate),
    });

    this.logger.log(`清理了 ${result.affected} 条过期日志`);
    return result.affected || 0;
  }
}
