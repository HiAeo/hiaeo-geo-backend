import { Repository } from 'typeorm';
import { SemanticEntity } from '../entities/semantic-entity.entity';
export declare class SemanticEntityService {
    private readonly entityRepository;
    constructor(entityRepository: Repository<SemanticEntity>);
    create(data: Partial<SemanticEntity>): Promise<SemanticEntity>;
    findAll(userId?: string): Promise<SemanticEntity[]>;
    findOne(id: number): Promise<SemanticEntity>;
    update(id: number, data: Partial<SemanticEntity>): Promise<SemanticEntity>;
    remove(id: number): Promise<void>;
}
