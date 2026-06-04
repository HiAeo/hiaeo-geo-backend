import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { OptimizationSuggestion, SuggestionStatus, SuggestionPriority } from '../entities/optimization-suggestion.entity';

@Injectable()
export class OptimizationSuggestionRepository {
  constructor(
    @InjectRepository(OptimizationSuggestion)
    private readonly repository: Repository<OptimizationSuggestion>,
  ) {}

  async findById(id: string): Promise<OptimizationSuggestion | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByBrandId(
    brandId: string,
    options?: {
      status?: string;
      category?: string;
      page?: number;
      size?: number;
    },
  ): Promise<OptimizationSuggestion[]> {
    const query: any = { brandId };
    
    if (options?.status) {
      query.status = options.status as any;
    }
    if (options?.category) {
      query.category = options.category as any;
    }

    return this.repository.find({
      where: query,
      order: { priority: 'DESC', createdAt: 'DESC' },
      skip: ((options?.page || 1) - 1) * (options?.size || 10),
      take: options?.size || 10,
    });
  }

  async countByBrandId(brandId: string, options?: { status?: string }): Promise<number> {
    const query: any = { brandId };
    if (options?.status) {
      query.status = options.status as any;
    }
    return this.repository.count({ where: query });
  }

  async findPendingHighPriority(brandId: string, limit: number = 5): Promise<OptimizationSuggestion[]> {
    return this.repository.find({
      where: {
        brandId,
        status: SuggestionStatus.PENDING,
        priority: In([SuggestionPriority.CRITICAL, SuggestionPriority.HIGH]),
      },
      order: { priority: 'DESC', createdAt: 'ASC' },
      take: limit,
    });
  }

  async findByDiagnosisReportId(reportId: string): Promise<OptimizationSuggestion[]> {
    return this.repository.find({
      where: { diagnosisReportId: reportId },
      order: { priority: 'DESC' },
    });
  }

  async findByIds(ids: string[]): Promise<OptimizationSuggestion[]> {
    return this.repository.find({ where: { id: In(ids) } });
  }

  async save(suggestion: OptimizationSuggestion): Promise<OptimizationSuggestion> {
    return this.repository.save(suggestion);
  }

  async update(id: string, data: Partial<OptimizationSuggestion>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    await this.repository.update({ id: In(ids) }, { status: status as any });
  }

  async countByStatus(brandId: string): Promise<Record<string, number>> {
    const suggestions = await this.repository.find({ where: { brandId } });
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      in_progress: 0,
      completed: 0,
      dismissed: 0,
    };
    
    for (const s of suggestions) {
      if (counts[s.status] !== undefined) {
        counts[s.status]++;
      }
    }
    
    return counts;
  }

  async getAverageProgress(brandId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('suggestion')
      .select('AVG(suggestion.progress)', 'avgProgress')
      .where('suggestion.brandId = :brandId', { brandId })
      .andWhere('suggestion.status != :status', { status: 'pending' })
      .getRawOne();
    
    return result?.avgProgress || 0;
  }
}
