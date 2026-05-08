import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SemanticEntity } from '../entities/semantic-entity.entity';

@Injectable()
export class SemanticEntityService {
  constructor(
    @InjectRepository(SemanticEntity)
    private readonly entityRepository: Repository<SemanticEntity>,
  ) {}

  async create(data: Partial<SemanticEntity>): Promise<SemanticEntity> {
    const entity = this.entityRepository.create(data);
    return this.entityRepository.save(entity);
  }

  async findAll(userId?: string): Promise<SemanticEntity[]> {
    if (userId) {
      return this.entityRepository.find({ where: { userId } });
    }
    return this.entityRepository.find();
  }

  async findOne(id: number): Promise<SemanticEntity> {
    const entity = await this.entityRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`语义实体ID ${id} 不存在`);
    }
    return entity;
  }

  async update(id: number, data: Partial<SemanticEntity>): Promise<SemanticEntity> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.entityRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.entityRepository.remove(entity);
  }
}
