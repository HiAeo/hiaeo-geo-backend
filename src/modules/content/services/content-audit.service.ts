import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentAudit } from '../entities/content-audit.entity';

@Injectable()
export class ContentAuditService {
  constructor(
    @InjectRepository(ContentAudit)
    private readonly auditRepository: Repository<ContentAudit>,
  ) {}

  async logAction(
    contentId: number,
    userId: string,
    action: string,
    changes?: any,
    reason?: string,
  ): Promise<ContentAudit> {
    const audit = new ContentAudit();
    audit.contentId = contentId;
    audit.userId = userId;
    audit.action = action;
    audit.changes = changes ? JSON.stringify(changes) : '';
    audit.reason = reason || '';
    return this.auditRepository.save(audit);
  }

  async getContentHistory(contentId: number): Promise<ContentAudit[]> {
    return this.auditRepository.find({
      where: { contentId },
      order: { createdAt: 'DESC' },
    });
  }
}
