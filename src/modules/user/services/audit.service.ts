"use strict";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { QueryAuditLogDto } from '../dto/query.dto';

/**
 * 敏感操作列表
 */
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

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * 记录审计日志
   */
  async log(params: {
    organizationId: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    before?: Record<string, any>;
    after?: Record<string, any>;
    ip?: string;
    userAgent?: string;
    result?: 'success' | 'failure';
    errorMessage?: string;
  }): Promise<AuditLog> {
    const isSensitive = SensitiveActions.some(a => 
      params.action.startsWith(a.split(':')[0]) && 
      params.action.includes(a.split(':')[1])
    ) || params.action.includes('delete') || params.action.includes('reset');

    const log = this.auditLogRepository.create({
      ...params,
      isSensitive,
      result: params.result || 'success',
    });

    return this.auditLogRepository.save(log);
  }

  /**
   * 查询审计日志
   */
  async findAll(query: QueryAuditLogDto): Promise<{ logs: AuditLog[]; total: number }> {
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

  /**
   * 获取用户操作历史
   */
  async getUserHistory(userId: string, limit: number = 20): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取资源变更历史
   */
  async getResourceHistory(resource: string, resourceId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resource, resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取敏感操作统计
   */
  async getSensitiveStats(organizationId: string, days: number = 30): Promise<Record<string, number>> {
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

    const stats: Record<string, number> = {};
    result.forEach(row => {
      stats[row.action] = parseInt(row.count, 10);
    });

    return stats;
  }

  /**
   * 清理过期日志（保留90天）
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('isSensitive = :isSensitive', { isSensitive: false })
      .execute();

    return result.affected || 0;
  }
}
