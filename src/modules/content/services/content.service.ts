import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../entities/content.entity';
import { CreateContentDto } from '../dto/create-content.dto';
import { QueryContentDto } from '../dto/query-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async create(createContentDto: CreateContentDto, userId: string): Promise<Content> {
    const content = this.contentRepository.create({
      ...createContentDto,
      userId,
    });
    return this.contentRepository.save(content);
  }

  async findAll(query: QueryContentDto): Promise<Content[]> {
    const queryBuilder = this.contentRepository.createQueryBuilder('content');

    if (query.keyword) {
      queryBuilder.andWhere('content.title LIKE :keyword', {
        keyword: `%${query.keyword}%`,
      });
    }

    if (query.type) {
      queryBuilder.andWhere('content.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('content.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('content.createdAt', 'DESC');

    if (query.page && query.limit) {
      queryBuilder.skip((query.page - 1) * query.limit).take(query.limit);
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`内容ID ${id} 不存在`);
    }
    return content;
  }

  async update(id: number, updateData: Partial<CreateContentDto>): Promise<Content> {
    const content = await this.findOne(id);
    Object.assign(content, updateData);
    return this.contentRepository.save(content);
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }
}
