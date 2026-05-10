"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InMemoryProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProvider = void 0;
const common_1 = require("@nestjs/common");
const vector_db_config_1 = require("../../config/vector-db.config");
let InMemoryProvider = InMemoryProvider_1 = class InMemoryProvider {
    constructor() {
        this.name = 'memory';
        this.logger = new common_1.Logger(InMemoryProvider_1.name);
        this.collections = new Map();
        this.initialized = false;
        this.metrics = {
            queryCount: 0,
            insertCount: 0,
            totalQueryLatency: 0,
            totalInsertLatency: 0,
        };
    }
    get vectorConfig() {
        return vector_db_config_1.vectorDbConfig.vector;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.logger.log('内存向量提供者初始化成功');
    }
    isInitialized() {
        return this.initialized;
    }
    async getCollection(name, dimension = this.vectorConfig.dimension, _metric = this.vectorConfig.metric) {
        if (!this.collections.has(name)) {
            this.collections.set(name, new Map());
        }
        const vectors = this.collections.get(name);
        let totalDimension = dimension;
        if (vectors.size > 0) {
            const firstVector = vectors.values().next().value;
            totalDimension = firstVector.vector.length;
        }
        return {
            name,
            dimension: totalDimension,
            vectorCount: vectors.size,
            metric: this.vectorConfig.metric,
        };
    }
    async insertVectors(collectionName, vectors) {
        const startTime = Date.now();
        let collection = this.collections.get(collectionName);
        if (!collection) {
            collection = new Map();
            this.collections.set(collectionName, collection);
        }
        for (const v of vectors) {
            collection.set(v.id, {
                id: v.id,
                vector: v.vector,
                metadata: v.metadata,
            });
        }
        this.metrics.insertCount += vectors.length;
        this.metrics.totalInsertLatency += Date.now() - startTime;
        this.logger.debug(`插入 ${vectors.length} 个向量到内存集合 ${collectionName}`);
    }
    async insertVectorsBatch(collectionName, vectors, _batchSize = 1000) {
        await this.insertVectors(collectionName, vectors);
    }
    async search(collectionName, options) {
        const startTime = Date.now();
        const collection = this.collections.get(collectionName);
        if (!collection || collection.size === 0) {
            return [];
        }
        const queryVector = options.vector;
        if (!queryVector) {
            return [];
        }
        const topK = options.topK || 10;
        const results = [];
        for (const [id, data] of collection.entries()) {
            if (options.filter) {
                const metadata = data.metadata || {};
                const matches = Object.entries(options.filter).every(([key, value]) => metadata[key] === value);
                if (!matches)
                    continue;
            }
            const score = this.cosineSimilarity(queryVector, data.vector);
            results.push({
                id,
                score,
                metadata: data.metadata,
            });
        }
        results.sort((a, b) => b.score - a.score);
        this.metrics.queryCount++;
        this.metrics.totalQueryLatency += Date.now() - startTime;
        return results.slice(0, topK);
    }
    async deleteVectors(collectionName, ids) {
        const collection = this.collections.get(collectionName);
        if (!collection) {
            return;
        }
        for (const id of ids) {
            collection.delete(id);
        }
        this.logger.debug(`从内存集合 ${collectionName} 删除 ${ids.length} 个向量`);
    }
    async getByIds(collectionName, ids) {
        const collection = this.collections.get(collectionName);
        if (!collection) {
            return [];
        }
        const vectors = [];
        for (const id of ids) {
            const data = collection.get(id);
            if (data) {
                vectors.push({
                    id: data.id,
                    vector: data.vector,
                    metadata: data.metadata,
                });
            }
        }
        return vectors;
    }
    async getIndexStatus(collectionName) {
        const collection = this.collections.get(collectionName);
        if (!collection) {
            return {
                exists: false,
                vectorCount: 0,
                dimension: this.vectorConfig.dimension,
                metric: this.vectorConfig.metric,
            };
        }
        let dimension = this.vectorConfig.dimension;
        if (collection.size > 0) {
            const firstVector = collection.values().next().value;
            dimension = firstVector.vector.length;
        }
        return {
            exists: true,
            vectorCount: collection.size,
            dimension,
            metric: this.vectorConfig.metric,
        };
    }
    async dropCollection(collectionName) {
        this.collections.delete(collectionName);
        this.logger.log(`删除内存集合: ${collectionName}`);
    }
    async checkHealth() {
        return {
            healthy: true,
            provider: this.name,
            details: {
                totalCollections: this.collections.size,
                totalVectors: Array.from(this.collections.values()).reduce((sum, col) => sum + col.size, 0),
            },
        };
    }
    async getMetrics() {
        const totalVectors = Array.from(this.collections.values()).reduce((sum, col) => sum + col.size, 0);
        return {
            totalVectors,
            totalCollections: this.collections.size,
            queryLatency: this.metrics.queryCount > 0 ? this.metrics.totalQueryLatency / this.metrics.queryCount : 0,
            insertLatency: this.metrics.insertCount > 0 ? this.metrics.totalInsertLatency / this.metrics.insertCount : 0,
            avgLatency: (this.metrics.totalQueryLatency + this.metrics.totalInsertLatency) / (this.metrics.queryCount + this.metrics.insertCount) || 0,
        };
    }
    async disconnect() {
        this.collections.clear();
        this.initialized = false;
        this.logger.log('内存向量提供者已清理');
    }
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            return 0;
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
    clearAll() {
        this.collections.clear();
        this.logger.log('清空所有内存向量数据');
    }
    getAllVectors(collectionName) {
        const collection = this.collections.get(collectionName);
        if (!collection) {
            return [];
        }
        return Array.from(collection.values()).map((v) => ({
            id: v.id,
            vector: v.vector,
            metadata: v.metadata,
        }));
    }
};
exports.InMemoryProvider = InMemoryProvider;
exports.InMemoryProvider = InMemoryProvider = InMemoryProvider_1 = __decorate([
    (0, common_1.Injectable)()
], InMemoryProvider);
//# sourceMappingURL=in-memory.provider.js.map