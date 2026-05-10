import { PublishContentDto, BatchPublishDto, PublishPlatform, PublishResultDto, QueryPublishDto, ExportContentDto } from '../dto/publish.dto';
export declare class PublishService {
    private publishRecords;
    publishContent(dto: PublishContentDto): Promise<PublishResultDto>;
    batchPublish(dto: BatchPublishDto): Promise<{
        results: PublishResultDto[];
        summary: {
            total: number;
            success: number;
            failed: number;
        };
    }>;
    getPublishList(query: QueryPublishDto): Promise<{
        list: PublishResultDto[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getPublishById(id: string): Promise<PublishResultDto | null>;
    cancelPublish(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    retryPublish(id: string): Promise<PublishResultDto>;
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
        platform: PublishPlatform;
        name: string;
        status: string;
        isConnected: boolean;
    }[]>;
    private publishToPlatform;
    private callPlatformAPI;
    private getMockContent;
    private formatPublishResult;
    private formatForCopy;
    private formatForExport;
    private generateHtml;
    private generateMarkdown;
    private getMimeType;
    private getPlatformName;
}
