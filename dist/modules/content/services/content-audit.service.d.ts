import { Repository } from 'typeorm';
import { ContentAudit } from '../entities/content-audit.entity';
export declare class ContentAuditService {
    private readonly auditRepository;
    constructor(auditRepository: Repository<ContentAudit>);
    logAction(contentId: number, userId: string, action: string, changes?: any, reason?: string): Promise<ContentAudit>;
    getContentHistory(contentId: number): Promise<ContentAudit[]>;
}
