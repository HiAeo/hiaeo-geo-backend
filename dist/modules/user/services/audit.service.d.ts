import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { QueryAuditLogDto } from '../dto/query.dto';
export declare class AuditService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(params: {
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
    }): Promise<AuditLog>;
    findAll(query: QueryAuditLogDto): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    getUserHistory(userId: string, limit?: number): Promise<AuditLog[]>;
    getResourceHistory(resource: string, resourceId: string): Promise<AuditLog[]>;
    getSensitiveStats(organizationId: string, days?: number): Promise<Record<string, number>>;
    cleanupOldLogs(daysToKeep?: number): Promise<number>;
}
