import { PublishService } from '../services/publish.service';
import { PublishContentDto, BatchPublishDto, QueryPublishDto, ExportContentDto } from '../dto/publish.dto';
export declare class PublishController {
    private readonly publishService;
    constructor(publishService: PublishService);
    publishContent(dto: PublishContentDto): Promise<import("../dto/publish.dto").PublishResultDto>;
    batchPublish(dto: BatchPublishDto): Promise<{
        results: import("../dto/publish.dto").PublishResultDto[];
        summary: {
            total: number;
            success: number;
            failed: number;
        };
    }>;
    getPublishList(query: QueryPublishDto): Promise<{
        list: import("../dto/publish.dto").PublishResultDto[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getPublishById(id: string): Promise<import("../dto/publish.dto").PublishResultDto | null>;
    cancelPublish(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    retryPublish(id: string): Promise<import("../dto/publish.dto").PublishResultDto>;
    copyContent(contentId: string): Promise<{
        success: boolean;
        content: string;
        format: string;
    }>;
    exportContent(dto: ExportContentDto): Promise<{
        success: boolean;
        fileName: string;
        content: string;
        mimeType: string;
    }>;
    getPlatformStatus(): Promise<{
        platform: import("../dto/publish.dto").PublishPlatform;
        name: string;
        status: string;
        isConnected: boolean;
    }[]>;
}
