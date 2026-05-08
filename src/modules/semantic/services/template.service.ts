import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentTemplate } from '../entities/content-template.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(ContentTemplate)
    private readonly templateRepository: Repository<ContentTemplate>,
  ) {}

  async create(data: Partial<ContentTemplate>): Promise<ContentTemplate> {
    const template = this.templateRepository.create(data);
    return this.templateRepository.save(template);
  }

  async findAll(userId?: string): Promise<ContentTemplate[]> {
    const query = this.templateRepository.createQueryBuilder('template')
      .where('template.active = :active', { active: true });
    
    if (userId) {
      query.andWhere('template.userId = :userId', { userId });
    }
    
    return query.getMany();
  }

  async findOne(id: number): Promise<ContentTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`模板ID ${id} 不存在`);
    }
    return template;
  }

  async applyTemplate(templateId: number, variables: Record<string, any>): Promise<string> {
    const template = await this.findOne(templateId);
    let content = template.content;
    
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    
    return content;
  }

  async update(id: number, data: Partial<ContentTemplate>): Promise<ContentTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, data);
    return this.templateRepository.save(template);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    template.active = false;
    await this.templateRepository.save(template);
  }
}
