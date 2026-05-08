import { ContentService } from '../services/content.service';
import { ContentAuditService } from '../services/content-audit.service';
import { CreateContentDto } from '../dto/create-content.dto';
import { QueryContentDto } from '../dto/query-content.dto';
export declare class ContentController {
    private readonly contentService;
    private readonly auditService;
    constructor(contentService: ContentService, auditService: ContentAuditService);
    create(createContentDto: CreateContentDto, req: any): Promise<import("../entities").Content>;
    findAll(query: QueryContentDto): Promise<import("../entities").Content[]>;
    findOne(id: number): Promise<import("../entities").Content>;
    update(id: number, updateData: Partial<CreateContentDto>, req: any): Promise<import("../entities").Content>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
}
