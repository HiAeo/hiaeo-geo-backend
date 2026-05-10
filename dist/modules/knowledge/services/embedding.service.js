"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmbeddingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../../ai/services/ai.service");
let EmbeddingService = EmbeddingService_1 = class EmbeddingService {
    constructor(aiService) {
        this.aiService = aiService;
        this.logger = new common_1.Logger(EmbeddingService_1.name);
        this.EMBEDDING_DIMENSIONS = 1536;
    }
    async generateEmbedding(text) {
        try {
            const embedding = await this.aiService.chat({
                messages: [
                    {
                        role: 'user',
                        content: `请将以下文本转换为向量表示（JSON格式的浮点数数组，长度1536）：\n\n${text}`,
                    },
                ],
                systemPrompt: '你是一个向量生成器。请将用户提供的文本转换为1536维的向量表示，以JSON数组格式返回。只返回数组，不要其他内容。',
                temperature: 0,
                maxTokens: 8000,
            }, 'deepseek');
            const vectorStr = embedding.message.content.trim();
            let vector;
            try {
                vector = JSON.parse(vectorStr);
            }
            catch {
                vector = this.generateSimulatedEmbedding(text);
            }
            if (vector.length !== this.EMBEDDING_DIMENSIONS) {
                vector = this.padOrTruncateVector(vector, this.EMBEDDING_DIMENSIONS);
            }
            return vector;
        }
        catch (error) {
            this.logger.error(`生成嵌入向量失败: ${error.message}`, error.stack);
            return this.generateSimulatedEmbedding(text);
        }
    }
    async generateKnowledgeBaseEmbedding(knowledgeData) {
        const sections = [];
        const moduleNames = [
            { key: 'basicInfo', name: '企业基础信息' },
            { key: 'bizPositioning', name: '核心业务与定位' },
            { key: 'productService', name: '产品与服务详情' },
            { key: 'competitorMarket', name: '竞品与市场信息' },
            { key: 'geoGoals', name: 'GEO推广目标' },
            { key: 'supplement', name: '补充信息' },
        ];
        const texts = [];
        for (const module of moduleNames) {
            const moduleData = knowledgeData[module.key];
            if (moduleData) {
                const text = this.flattenModuleToText(moduleData);
                if (text) {
                    texts.push(text);
                    const vector = await this.generateEmbedding(text);
                    sections.push({ name: module.name, vector });
                }
            }
        }
        const combinedText = texts.join('\n---\n');
        const combinedEmbedding = await this.generateEmbedding(combinedText);
        return {
            embedding: combinedEmbedding,
            sections,
        };
    }
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('向量维度不匹配');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);
        if (normA === 0 || normB === 0) {
            return 0;
        }
        return dotProduct / (normA * normB);
    }
    findMostSimilar(queryVector, vectors, topK = 5) {
        const similarities = vectors.map((v) => ({
            id: v.id,
            similarity: this.cosineSimilarity(queryVector, v.vector),
            metadata: v.metadata,
        }));
        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, topK);
    }
    async batchGenerateEmbeddings(texts) {
        const embeddings = [];
        for (const text of texts) {
            const embedding = await this.generateEmbedding(text);
            embeddings.push(embedding);
        }
        return embeddings;
    }
    generateSimulatedEmbedding(text) {
        const vector = [];
        const hash = this.simpleHash(text);
        for (let i = 0; i < this.EMBEDDING_DIMENSIONS; i++) {
            const seed = hash + i * 31;
            vector.push(this.seededRandom(seed));
        }
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map((val) => val / magnitude);
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash;
    }
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }
    padOrTruncateVector(vector, targetDim) {
        if (vector.length > targetDim) {
            return vector.slice(0, targetDim);
        }
        else if (vector.length < targetDim) {
            const padded = [...vector];
            while (padded.length < targetDim) {
                padded.push(0);
            }
            return padded;
        }
        return vector;
    }
    flattenModuleToText(moduleData) {
        if (!moduleData)
            return '';
        const parts = [];
        const flatten = (obj, prefix = '') => {
            if (obj === null || obj === undefined)
                return;
            if (typeof obj === 'string') {
                if (prefix && obj) {
                    parts.push(`${prefix}: ${obj}`);
                }
                return;
            }
            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    if (typeof item === 'object') {
                        flatten(item, `${prefix}[${index}]`);
                    }
                    else if (item) {
                        parts.push(`${prefix}[${index}]: ${item}`);
                    }
                });
                return;
            }
            if (typeof obj === 'object') {
                Object.entries(obj).forEach(([key, value]) => {
                    const newPrefix = prefix ? `${prefix}.${key}` : key;
                    flatten(value, newPrefix);
                });
            }
        };
        flatten(moduleData);
        return parts.join('\n');
    }
};
exports.EmbeddingService = EmbeddingService;
exports.EmbeddingService = EmbeddingService = EmbeddingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], EmbeddingService);
//# sourceMappingURL=embedding.service.js.map