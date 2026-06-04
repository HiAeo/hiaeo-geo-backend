import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeVersion } from '../entities/knowledge-version.entity';

@Injectable()
export class KnowledgeVersionRepository {
  constructor(
    @InjectRepository(KnowledgeVersion)
    private readonly repository: Repository<KnowledgeVersion>,
  ) {}

  async findById(id: string): Promise<KnowledgeVersion | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByOrganizationAndVersion(
    organizationId: string,
    version: number,
  ): Promise<KnowledgeVersion | null> {
    return this.repository.findOne({
      where: { organizationId, version },
    });
  }

  async findByOrganization(
    organizationId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<KnowledgeVersion[]> {
    return this.repository.find({
      where: { organizationId },
      order: { version: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
  }

  async findAndCount(
    organizationId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<[KnowledgeVersion[], number]> {
    return this.repository.findAndCount({
      where: { organizationId },
      order: { version: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
  }

  async save(version: KnowledgeVersion): Promise<KnowledgeVersion> {
    return this.repository.save(version);
  }

  async delete(ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }

  async count(organizationId: string): Promise<number> {
    return this.repository.count({ where: { organizationId } });
  }
}
