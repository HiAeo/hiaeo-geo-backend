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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VectorStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStorageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_knowledge_base_entity_1 = require("../entities/brand-knowledge-base.entity");
const embedding_service_1 = require("./embedding.service");
const vector_db_factory_service_1 = require("../../../services/vector-db-factory.service");
const vector_db_config_1 = require("../../../config/vector-db.config");
let VectorStorageService = VectorStorageService_1 = class VectorStorageService {
    constructor(knowledgeRepository, embeddingService) {
        this.knowledgeRepository = knowledgeRepository;
        this.embeddingService = embeddingService;
        this.logger = new common_1.Logger(VectorStorageService_1.name);
        this.initialized = false;
        this.memoryStore = new Map();
        this.provider = vector_db_factory_service_1.VectorDbFactory.createProvider();
        this.collectionName = this.getCollectionName();
    }
    async onModuleInit() {
        await this.initializeProvider();
    }
    async initializeProvider() {
        if (this.initialized) {
            return;
        }
        try {
            await this.provider.initialize();
            await this.provider.getCollection(this.collectionName);
            this.initialized = true;
            this.logger.log(`向量存储服务初始化成功，提供者: ${this.provider.name}`);
        }
        catch (error) {
            this.logger.error(`向量提供者初始化失败: ${error.message}`);
            if (vector_db_config_1.vectorDbConfig.fallback.enabled) {
                this.logger.warn('启用内存存储作为回退方案');
                this.provider = vector_db_factory_service_1.VectorDbFactory.createProvider('memory');
                await this.provider.initialize();
                await this.provider.getCollection(this.collectionName);
                this.initialized = true;
            }
            else {
                throw error;
            }
        }
    }
    getCollectionName() {
        const provider = vector_db_config_1.vectorDbConfig.provider;
        switch (provider) {
            case 'milvus':
                return vector_db_config_1.vectorDbConfig.milvus.collectionName;
            case 'pinecone':
                return vector_db_config_1.vectorDbConfig.pinecone.indexName;
            case 'qdrant':
                return vector_db_config_1.vectorDbConfig.qdrant.collectionName;
            default:
                return 'brand_knowledge_embeddings';
        }
    }
    async indexKnowledgeBase(organizationId) {
        await this.ensureInitialized();
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            throw new Error('知识库不存在');
        }
        const { embedding, sections } = await this.embeddingService.generateKnowledgeBaseEmbedding({
            basicInfo: knowledge.basicInfo,
            bizPositioning: knowledge.bizPositioning,
            productService: knowledge.productService,
            competitorMarket: knowledge.competitorMarket,
            geoGoals: knowledge.geoGoals,
            supplement: knowledge.supplement,
        });
        const storeKey = `org:${organizationId}`;
        const existing = this.memoryStore.get(storeKey);
        const vectors = [
            {
                id: `${storeKey}:main`,
                vector: embedding,
                metadata: { organizationId, type: 'main', section: 'all' },
            },
            ...sections.map((s, index) => ({
                id: `${storeKey}:section:${index}`,
                vector: s.vector,
                metadata: { organizationId, type: 'section', section: s.name, text: this.getSectionText(knowledge, s.name) },
            })),
        ];
        await this.provider.insertVectors(this.collectionName, vectors);
        this.memoryStore.set(storeKey, {
            organizationId,
            embedding,
            sections: sections.map((s) => ({
                ...s,
                text: this.getSectionText(knowledge, s.name),
            })),
            updatedAt: new Date(),
        });
        this.logger.log(`知识库向量索引已${existing ? '更新' : '创建'} - org: ${organizationId}`);
        return {
            status: existing ? 'updated' : 'created',
            sections: sections.map((s) => s.name),
        };
    }
    async semanticSearch(organizationId, query, topK = 5) {
        await this.ensureInitialized();
        const storeKey = `org:${organizationId}`;
        const stored = this.memoryStore.get(storeKey);
        if (!stored) {
            await this.indexKnowledgeBase(organizationId);
            return this.semanticSearch(organizationId, query, topK);
        }
        const queryVector = await this.embeddingService.generateEmbedding(query);
        if (this.provider.name !== 'memory') {
            try {
                const searchResults = await this.provider.search(this.collectionName, {
                    vector: queryVector,
                    topK: topK,
                    filter: { organizationId },
                    includeMetadata: true,
                });
                const results = searchResults
                    .filter((r) => r.metadata && r.metadata.section)
                    .map((r) => ({
                    section: r.metadata?.section || 'unknown',
                    similarity: r.score,
                    text: r.metadata?.text || '',
                }));
                if (results.length > 0) {
                    return { results };
                }
            }
            catch (error) {
                this.logger.warn(`向量数据库搜索失败，使用内存搜索: ${error.message}`);
            }
        }
        const results = stored.sections.map((section) => ({
            section: section.name,
            similarity: this.embeddingService.cosineSimilarity(queryVector, section.vector),
            text: section.text,
        }));
        results.sort((a, b) => b.similarity - a.similarity);
        return {
            results: results.slice(0, topK),
        };
    }
    async findSimilarKnowledgeBases(organizationId, topK = 5) {
        await this.ensureInitialized();
        const storeKey = `org:${organizationId}`;
        const targetStore = this.memoryStore.get(storeKey);
        if (!targetStore) {
            throw new Error('请先索引目标组织的知识库');
        }
        const similarities = [];
        for (const [key, store] of this.memoryStore.entries()) {
            if (key === storeKey)
                continue;
            const similarity = this.embeddingService.cosineSimilarity(targetStore.embedding, store.embedding);
            similarities.push({
                organizationId: store.organizationId,
                similarity,
            });
        }
        similarities.sort((a, b) => b.similarity - a.similarity);
        return {
            similar: similarities.slice(0, topK),
        };
    }
    async deleteIndex(organizationId) {
        await this.ensureInitialized();
        const storeKey = `org:${organizationId}`;
        const deleted = this.memoryStore.delete(storeKey);
        if (this.provider.name !== 'memory') {
            try {
                const allIds = [`${storeKey}:main`];
                const stored = this.memoryStore.get(storeKey);
                if (stored) {
                    for (let i = 0; i < stored.sections.length; i++) {
                        allIds.push(`${storeKey}:section:${i}`);
                    }
                }
                await this.provider.deleteVectors(this.collectionName, allIds);
            }
            catch (error) {
                this.logger.warn(`从向量数据库删除失败: ${error.message}`);
            }
        }
        if (deleted) {
            this.logger.log(`知识库向量索引已删除 - org: ${organizationId}`);
        }
        return deleted;
    }
    async getIndexStatus(organizationId) {
        await this.ensureInitialized();
        const storeKey = `org:${organizationId}`;
        const stored = this.memoryStore.get(storeKey);
        if (!stored) {
            return { indexed: false, sections: [] };
        }
        return {
            indexed: true,
            sections: stored.sections.map((s) => s.name),
            updatedAt: stored.updatedAt,
        };
    }
    async batchIndex(organizationIds) {
        const failed = [];
        let success = 0;
        for (const orgId of organizationIds) {
            try {
                await this.indexKnowledgeBase(orgId);
                success++;
            }
            catch (error) {
                this.logger.error(`索引失败 - org: ${orgId}, error: ${error.message}`);
                failed.push(orgId);
            }
        }
        return { success, failed };
    }
    async getStorageStats() {
        await this.ensureInitialized();
        let totalVectors = 0;
        let totalDimensions = 0;
        for (const store of this.memoryStore.values()) {
            totalVectors += 1 + store.sections.length;
            totalDimensions += store.embedding.length + store.sections.reduce((sum, s) => sum + s.vector.length, 0);
        }
        const memoryBytes = totalDimensions * 8;
        const memoryUsage = memoryBytes > 1024 * 1024
            ? `${(memoryBytes / (1024 * 1024)).toFixed(2)} MB`
            : `${(memoryBytes / 1024).toFixed(2)} KB`;
        const result = {
            totalOrganizations: this.memoryStore.size,
            memoryUsage,
            provider: this.provider.name,
        };
        if (this.provider.name !== 'memory') {
            try {
                const metrics = await this.provider.getMetrics();
                result.vectorDbStats = {
                    totalVectors: metrics.totalVectors,
                    totalCollections: metrics.totalCollections,
                };
            }
            catch (error) {
                this.logger.warn(`获取向量数据库统计失败: ${error.message}`);
            }
        }
        return result;
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initializeProvider();
        }
    }
    getSectionText(knowledge, sectionName) {
        const sectionMap = {
            '企业基础信息': knowledge.basicInfo,
            '核心业务与定位': knowledge.bizPositioning,
            '产品与服务详情': knowledge.productService,
            '竞品与市场信息': knowledge.competitorMarket,
            'GEO推广目标': knowledge.geoGoals,
            '补充信息': knowledge.supplement,
        };
        const data = sectionMap[sectionName];
        if (!data)
            return '';
        return this.flattenToText(data);
    }
    flattenToText(obj, prefix = '') {
        if (!obj)
            return '';
        const parts = [];
        const flatten = (value, key) => {
            if (value === null || value === undefined)
                return;
            if (typeof value === 'string' && value) {
                parts.push(`${key}: ${value}`);
                return;
            }
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        flatten(item, `${key}[${index}]`);
                    }
                    else if (item) {
                        parts.push(`${key}[${index}]: ${item}`);
                    }
                });
                return;
            }
            if (typeof value === 'object') {
                Object.entries(value).forEach(([k, v]) => {
                    const newKey = prefix ? `${prefix}.${k}` : k;
                    flatten(v, newKey);
                });
            }
        };
        Object.entries(obj).forEach(([key, value]) => {
            flatten(value, key);
        });
        return parts.join('\n');
    }
};
exports.VectorStorageService = VectorStorageService;
exports.VectorStorageService = VectorStorageService = VectorStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_knowledge_base_entity_1.BrandKnowledgeBase)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        embedding_service_1.EmbeddingService])
], VectorStorageService);
//# sourceMappingURL=vector-storage.service.js.map