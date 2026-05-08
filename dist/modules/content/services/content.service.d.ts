import { Repository } from 'typeorm';
import { Content } from '../entities/content.entity';
import { CreateContentDto } from '../dto/create-content.dto';
import { QueryContentDto } from '../dto/query-content.dto';
export declare class ContentService {
    private readonly contentRepository;
    constructor(contentRepository: Repository<Content>);
    create(createContentDto: CreateContentDto, userId: string): Promise<Content>;
    findAll(query: QueryContentDto): Promise<Content[]>;
    findOne(id: number): Promise<Content>;
    update(id: number, updateData: Partial<CreateContentDto>): Promise<Content>;
    remove(id: number): Promise<void>;
}
