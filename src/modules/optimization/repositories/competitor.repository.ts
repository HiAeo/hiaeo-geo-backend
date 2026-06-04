import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Competitor } from '../entities/competitor.entity';

@Injectable()
export class CompetitorRepository {
  constructor(
    @InjectRepository(Competitor)
    private readonly repository: Repository<Competitor>,
  ) {}

  async findById(id: string): Promise<Competitor | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByBrandName(brandName: string): Promise<Competitor[]> {
    return this.repository.find({
      where: { brandName },
      order: { createdAt: 'DESC' },
    });
  }

  async findTrackedCompetitors(): Promise<Competitor[]> {
    return this.repository.find({
      where: { isTracked: true },
      order: { brandName: 'ASC' },
    });
  }

  async findTrackedBrands(): Promise<string[]> {
    const competitors = await this.repository.find({
      where: { isTracked: true },
      select: ['brandName'],
    });
    return [...new Set(competitors.map(c => c.brandName))];
  }

  async save(competitor: Competitor): Promise<Competitor> {
    return this.repository.save(competitor);
  }

  async update(id: string, data: Partial<Competitor>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByIds(ids: string[]): Promise<Competitor[]> {
    return this.repository.find({ where: { id: In(ids) } });
  }

  async findByBrand(brandName: string): Promise<Competitor[]> {
    return this.repository.find({
      where: { brandName },
      order: { suppressionScore: 'DESC' },
    });
  }

  async countTracked(brandName: string): Promise<number> {
    return this.repository.count({
      where: { brandName, isTracked: true },
    });
  }

  async getTopCompetitors(brandName: string, limit: number = 5): Promise<Competitor[]> {
    return this.repository.find({
      where: { brandName, isTracked: true },
      order: { suppressionScore: 'DESC' },
      take: limit,
    });
  }
}
