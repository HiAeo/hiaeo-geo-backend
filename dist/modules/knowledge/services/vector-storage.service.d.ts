import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { EmbeddingService } from './embedding.service';
export declare class VectorStorageService implements OnModuleInit {
    private knowledgeRepository;
    private embeddingService;
    private readonly logger;
    private provider;
    private collectionName;
    private initialized;
    private memoryStore;
    constructor(knowledgeRepository: Repository<BrandKnowledgeBase>, embeddingService: EmbeddingService);
    onModuleInit(): Promise<void>;
    private initializeProvider;
    private getCollectionName;
    indexKnowledgeBase(organizationId: string): Promise<{
        status: 'created' | 'updated';
        sections: string[];
    }>;
    semanticSearch(organizationId: string, query: string, topK?: number): Promise<{
        results: {
            section: string;
            similarity: number;
            text: string;
        }[];
    }>;
    findSimilarKnowledgeBases(organizationId: string, topK?: number): Promise<{
        similar: {
            organizationId: string;
            similarity: number;
        }[];
    }>;
    deleteIndex(organizationId: string): Promise<boolean>;
    getIndexStatus(organizationId: string): Promise<{
        indexed: boolean;
        sections: string[];
        updatedAt?: Date;
    }>;
    batchIndex(organizationIds: string[]): Promise<{
        success: number;
        failed: string[];
    }>;
    getStorageStats(): Promise<{
        totalOrganizations: number;
        memoryUsage: string;
        provider: string;
        vectorDbStats?: {
            totalVectors: number;
            totalCollections: number;
        };
    }>;
    private ensureInitialized;
    private getSectionText;
    private flattenToText;
}
