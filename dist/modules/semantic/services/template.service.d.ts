import { Repository } from 'typeorm';
import { ContentTemplate } from '../entities/content-template.entity';
export declare class TemplateService {
    private readonly templateRepository;
    constructor(templateRepository: Repository<ContentTemplate>);
    create(data: Partial<ContentTemplate>): Promise<ContentTemplate>;
    findAll(userId?: string): Promise<ContentTemplate[]>;
    findOne(id: number): Promise<ContentTemplate>;
    applyTemplate(templateId: number, variables: Record<string, any>): Promise<string>;
    update(id: number, data: Partial<ContentTemplate>): Promise<ContentTemplate>;
    remove(id: number): Promise<void>;
}
