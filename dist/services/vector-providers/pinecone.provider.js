"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PineconeProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PineconeProvider = void 0;
const common_1 = require("@nestjs/common");
const pinecone_1 = require("@pinecone-database/pinecone");
const vector_db_config_1 = require("../../config/vector-db.config");
let PineconeProvider = PineconeProvider_1 = class PineconeProvider {
    constructor() {
        this.name = 'pinecone';
        this.logger = new common_1.Logger(PineconeProvider_1.name);
        this.client = null;
        this.index = null;
        this.initialized = false;
        this.metrics = {
            queryCount: 0,
            insertCount: 0,
            totalQueryLatency: 0,
            totalInsertLatency: 0,
        };
    }
    get config() {
        return vector_db_config_1.vectorDbConfig.pinecone;
    }
    get vectorConfig() {
        return vector_db_config_1.vectorDbConfig.vector;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            this.logger.log('初始化 Pinecone 连接');
            this.client = new pinecone_1.Pinecone({
                apiKey: this.config.apiKey,
            });
            await this.client.describeIndex(this.config.indexName);
            this.index = this.client.Index(this.config.indexName);
            this.initialized = true;
            this.logger.log('Pinecone 连接初始化成功');
        }
        catch (error) {
            this.logger.error(`Pinecone 连接初始化失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    isInitialized() {
        return this.initialized;
    }
    async getCollection(name, dimension = this.vectorConfig.dimension, metric = this.vectorConfig.metric) {
        this.ensureInitialized();
        try {
            const indexName = name || this.config.indexName;
            let indexDescription;
            try {
                indexDescription = await this.client.describeIndex(indexName);
            }
            catch {
                this.logger.log(`创建 Pinecone 索引: ${indexName}`);
                await this.client.createIndex({
                    name: indexName,
                    dimension,
                    metric: this.getPineconeMetric(metric),
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: 'us-east-1',
                        },
                    },
                });
                await this.waitForIndex(indexName);
                indexDescription = await this.client.describeIndex(indexName);
            }
            this.index = this.client.Index(indexName);
            return {
                name: indexDescription.name,
                dimension: indexDescription.dimension,
                vectorCount: 0,
                metric: indexDescription.metric || metric,
            };
        }
        catch (error) {
            this.logger.error(`获取 Pinecone 索引失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async insertVectors(collectionName, vectors) {
        this.ensureInitialized();
        const startTime = Date.now();
        try {
            const index = this.index || this.client.Index(collectionName);
            const records = vectors.map((v) => ({
                id: v.id,
                values: v.vector,
                metadata: v.metadata || {},
            }));
            await index.upsert(records);
            this.metrics.insertCount += vectors.length;
            this.metrics.totalInsertLatency += Date.now() - startTime;
            this.logger.debug(`插入 ${vectors.length} 个向量到 ${collectionName}`);
        }
        catch (error) {
            this.logger.error(`插入向量失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async insertVectorsBatch(collectionName, vectors, batchSize = 100) {
        this.ensureInitialized();
        const index = this.index || this.client.Index(collectionName);
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            const records = batch.map((v) => ({
                id: v.id,
                values: v.vector,
                metadata: v.metadata || {},
            }));
            await index.upsert(records);
            this.logger.debug(`批量插入进度: ${Math.min(i + batchSize, vectors.length)}/${vectors.length}`);
        }
    }
    async search(collectionName, options) {
        this.ensureInitialized();
        const startTime = Date.now();
        try {
            const index = this.index || this.client.Index(collectionName);
            const queryResponse = await index.query({
                vector: options.vector || [],
                topK: options.topK || 10,
                includeMetadata: options.includeMetadata !== false,
                filter: options.filter,
            });
            this.metrics.queryCount++;
            this.metrics.totalQueryLatency += Date.now() - startTime;
            return (queryResponse.matches || []).map((match) => ({
                id: match.id,
                score: match.score || 0,
                metadata: match.metadata,
            }));
        }
        catch (error) {
            this.logger.error(`搜索失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteVectors(collectionName, ids) {
        this.ensureInitialized();
        try {
            const index = this.index || this.client.Index(collectionName);
            await index.deleteMany(ids);
            this.logger.debug(`从 ${collectionName} 删除 ${ids.length} 个向量`);
        }
        catch (error) {
            this.logger.error(`删除向量失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getByIds(collectionName, ids) {
        this.ensureInitialized();
        try {
            const index = this.index || this.client.Index(collectionName);
            const results = await index.fetch(ids);
            return Object.values(results.records).map((record) => ({
                id: record.id,
                vector: record.values,
                metadata: record.metadata,
            }));
        }
        catch (error) {
            this.logger.error(`获取向量失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getIndexStatus(collectionName) {
        this.ensureInitialized();
        try {
            const indexName = collectionName || this.config.indexName;
            const description = await this.client.describeIndex(indexName);
            return {
                exists: true,
                vectorCount: 0,
                dimension: description.dimension,
                metric: description.metric || this.vectorConfig.metric,
            };
        }
        catch (error) {
            return {
                exists: false,
                vectorCount: 0,
                dimension: this.vectorConfig.dimension,
                metric: this.vectorConfig.metric,
            };
        }
    }
    async dropCollection(collectionName) {
        this.ensureInitialized();
        try {
            await this.client.deleteIndex(collectionName);
            this.logger.log(`删除 Pinecone 索引: ${collectionName}`);
        }
        catch (error) {
            this.logger.error(`删除索引失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async checkHealth() {
        const startTime = Date.now();
        try {
            this.ensureInitialized();
            const description = await this.client.describeIndex(this.config.indexName);
            return {
                healthy: true,
                provider: this.name,
                latency: Date.now() - startTime,
                details: {
                    indexName: description.name,
                    dimension: description.dimension,
                },
            };
        }
        catch (error) {
            return {
                healthy: false,
                provider: this.name,
                latency: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    async getMetrics() {
        return {
            totalVectors: this.metrics.insertCount,
            totalCollections: 1,
            queryLatency: this.metrics.queryCount > 0 ? this.metrics.totalQueryLatency / this.metrics.queryCount : 0,
            insertLatency: this.metrics.insertCount > 0 ? this.metrics.totalInsertLatency / this.metrics.insertCount : 0,
            avgLatency: (this.metrics.totalQueryLatency + this.metrics.totalInsertLatency) / (this.metrics.queryCount + this.metrics.insertCount) || 0,
        };
    }
    async disconnect() {
        this.client = null;
        this.index = null;
        this.initialized = false;
        this.logger.log('Pinecone 连接已关闭');
    }
    ensureInitialized() {
        if (!this.initialized || !this.client) {
            throw new Error('Pinecone 提供者未初始化，请先调用 initialize()');
        }
    }
    async waitForIndex(indexName, maxWaitTime = 60000) {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            const description = await this.client.describeIndex(indexName);
            if (description.status?.ready) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        throw new Error(`等待索引 ${indexName} 准备就绪超时`);
    }
    getPineconeMetric(metric) {
        switch (metric.toUpperCase()) {
            case 'COSINE':
                return 'cosine';
            case 'IP':
                return 'dotproduct';
            case 'L2':
                return 'euclidean';
            default:
                return 'cosine';
        }
    }
};
exports.PineconeProvider = PineconeProvider;
exports.PineconeProvider = PineconeProvider = PineconeProvider_1 = __decorate([
    (0, common_1.Injectable)()
], PineconeProvider);
//# sourceMappingURL=pinecone.provider.js.map