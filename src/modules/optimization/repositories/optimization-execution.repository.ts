import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OptimizationExecution, ExecutionStatus } from '../entities/optimization-execution.entity';

@Injectable()
export class OptimizationExecutionRepository {
  constructor(
    @InjectRepository(OptimizationExecution)
    private readonly repository: Repository<OptimizationExecution>,
  ) {}

  async findById(id: string): Promise<OptimizationExecution | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['suggestion'],
    });
  }

  async findByBrandId(brandId: string, page: number = 1, size: number = 10): Promise<OptimizationExecution[]> {
    return this.repository.find({
      where: { brandId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
  }

  async findBySuggestionId(suggestionId: string): Promise<OptimizationExecution[]> {
    return this.repository.find({
      where: { suggestionId },
      order: { createdAt: 'DESC' },
    });
  }

  async countByBrandId(brandId: string): Promise<number> {
    return this.repository.count({ where: { brandId } });
  }

  async save(execution: OptimizationExecution): Promise<OptimizationExecution> {
    return this.repository.save(execution);
  }

  async update(id: string, data: Partial<OptimizationExecution>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByIds(ids: string[]): Promise<OptimizationExecution[]> {
    return this.repository.find({ where: { id: In(ids) } });
  }

  async findPendingExecutions(brandId: string): Promise<OptimizationExecution[]> {
    return this.repository.find({
      where: { brandId, status: ExecutionStatus.PENDING },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }

  async findByStatus(status: ExecutionStatus, limit: number = 50): Promise<OptimizationExecution[]> {
    return this.repository.find({
      where: { status },
      order: { priority: 'DESC', createdAt: 'ASC' },
      take: limit,
    });
  }
}
