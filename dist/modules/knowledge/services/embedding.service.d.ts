import { AiService } from '../../ai/services/ai.service';
export declare class EmbeddingService {
    private readonly aiService;
    private readonly logger;
    private readonly EMBEDDING_DIMENSIONS;
    constructor(aiService: AiService);
    generateEmbedding(text: string): Promise<number[]>;
    generateKnowledgeBaseEmbedding(knowledgeData: {
        basicInfo?: any;
        bizPositioning?: any;
        productService?: any;
        competitorMarket?: any;
        geoGoals?: any;
        supplement?: any;
    }): Promise<{
        embedding: number[];
        sections: {
            name: string;
            vector: number[];
        }[];
    }>;
    cosineSimilarity(vecA: number[], vecB: number[]): number;
    findMostSimilar(queryVector: number[], vectors: {
        id: string;
        vector: number[];
        metadata?: any;
    }[], topK?: number): {
        id: string;
        similarity: number;
        metadata?: any;
    }[];
    batchGenerateEmbeddings(texts: string[]): Promise<number[][]>;
    private generateSimulatedEmbedding;
    private simpleHash;
    private seededRandom;
    private padOrTruncateVector;
    private flattenModuleToText;
}
