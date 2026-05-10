import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto, GetKnowledgeBaseDto, FileUploadResponseDto, KnowledgeVersionDto, AiSuggestResponseDto } from '../dto/knowledge.dto';
export declare class KnowledgeService {
    private readonly knowledgeRepository;
    private readonly logger;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>);
    getKnowledgeBase(organizationId: string): Promise<GetKnowledgeBaseDto | null>;
    createKnowledgeBase(organizationId: string, dto: CreateKnowledgeBaseDto): Promise<GetKnowledgeBaseDto>;
    updateKnowledgeBase(organizationId: string, dto: UpdateKnowledgeBaseDto): Promise<GetKnowledgeBaseDto>;
    uploadFile(organizationId: string, module: string, file: any): Promise<FileUploadResponseDto>;
    deleteFile(organizationId: string, fileId: string): Promise<boolean>;
    getVersionHistory(organizationId: string, page?: number, size?: number): Promise<{
        list: KnowledgeVersionDto[];
        total: number;
    }>;
    getAiSuggestion(field: string, source?: string): Promise<AiSuggestResponseDto>;
    private mapToDto;
}
