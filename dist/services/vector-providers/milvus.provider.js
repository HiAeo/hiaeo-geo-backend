"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MilvusProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilvusProvider = void 0;
const common_1 = require("@nestjs/common");
const milvus2_sdk_node_1 = require("@zilliz/milvus2-sdk-node");
const uuid_1 = require("uuid");
const vector_db_config_1 = require("../../config/vector-db.config");
let MilvusProvider = MilvusProvider_1 = class MilvusProvider {
    constructor() {
        this.name = 'milvus';
        this.logger = new common_1.Logger(MilvusProvider_1.name);
        this.client = null;
        this.initialized = false;
        this.metrics = {
            queryCount: 0,
            insertCount: 0,
            totalQueryLatency: 0,
            totalInsertLatency: 0,
        };
    }
    get config() {
        return vector_db_config_1.vectorDbConfig.milvus;
    }
    get vectorConfig() {
        return vector_db_config_1.vectorDbConfig.vector;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            this.logger.log(`初始化 Milvus 连接: ${this.config.address}`);
            this.client = new milvus2_sdk_node_1.MilvusClient({
                address: this.config.address,
                username: this.config.username || undefined,
                password: this.config.password || undefined,
                ssl: this.config.ssl,
                timeout: this.config.timeout,
            });
            await this.client.checkHealth();
            this.initialized = true;
            this.logger.log('Milvus 连接初始化成功');
        }
        catch (error) {
            this.logger.error(`Milvus 连接初始化失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    isInitialized() {
        return this.initialized;
    }
    async getCollection(name, dimension = this.vectorConfig.dimension, metric = this.vectorConfig.metric) {
        this.ensureInitialized();
        try {
            const exists = await this.client.hasCollection({ collection_name: name });
            if (!exists) {
                const metricType = this.getMilvusMetricType(metric);
                await this.client.createCollection({
                    collection_name: name,
                    fields: [
                        {
                            name: 'id',
                            data_type: 'VarChar',
                            max_length: 64,
                            is_primary_key: true,
                        },
                        {
                            name: 'vector',
                            data_type: 'FloatVector',
                            dim: dimension,
                        },
                        {
                            name: 'metadata',
                            data_type: 'VarChar',
                            max_length: 65535,
                        },
                    ],
                });
                await this.client.createIndex({
                    collection_name: name,
                    field_name: 'vector',
                    index_type: 'IVF_FLAT',
                    metric_type: String(metricType),
                    params: { nlist: 128 },
                });
                await this.client.loadCollectionSync({ collection_name: name });
                this.logger.log(`Milvus 集合创建成功: ${name}`);
            }
            const stats = await this.client.getCollectionStatistics({
                collection_name: name,
            });
            return {
                name,
                dimension,
                vectorCount: parseInt(stats.data.total_vector_count || '0', 10),
                metric,
            };
        }
        catch (error) {
            this.logger.error(`获取 Milvus 集合失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async insertVectors(collectionName, vectors) {
        this.ensureInitialized();
        const startTime = Date.now();
        try {
            await this.ensureCollectionExists(collectionName);
            const data = vectors.map((v) => ({
                id: v.id || (0, uuid_1.v4)(),
                vector: v.vector,
                metadata: v.metadata ? JSON.stringify(v.metadata) : '',
            }));
            await this.client.insert({
                collection_name: collectionName,
                fields_data: data,
            });
            this.metrics.insertCount += vectors.length;
            this.metrics.totalInsertLatency += Date.now() - startTime;
            this.logger.debug(`插入 ${vectors.length} 个向量到 ${collectionName}`);
        }
        catch (error) {
            this.logger.error(`插入向量失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async insertVectorsBatch(collectionName, vectors, batchSize = 1000) {
        this.ensureInitialized();
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await this.insertVectors(collectionName, batch);
        }
    }
    async search(collectionName, options) {
        this.ensureInitialized();
        const startTime = Date.now();
        try {
            await this.ensureCollectionExists(collectionName);
            const searchParams = {
                collection_name: collectionName,
                vector_field_name: 'vector',
                top_k: options.topK || 10,
                vectors: [options.vector || []],
                output_fields: ['id', 'metadata'],
            };
            const results = await this.client.search(searchParams);
            this.metrics.queryCount++;
            this.metrics.totalQueryLatency += Date.now() - startTime;
            return (results.results || []).map((hit) => ({
                id: hit.id,
                score: hit.score,
                metadata: hit.metadata ? JSON.parse(hit.metadata) : undefined,
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
            await this.client.deleteEntities({
                collection_name: collectionName,
                expr: `id in [${ids.map((id) => `"${id}"`).join(',')}]`,
            });
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
            const results = await this.client.query({
                collection_name: collectionName,
                output_fields: ['id', 'vector', 'metadata'],
                filter: `id in [${ids.map((id) => `"${id}"`).join(',')}]`,
            });
            return (results.data || []).map((item) => ({
                id: item.id,
                vector: item.vector,
                metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
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
            const exists = await this.client.hasCollection({ collection_name: collectionName });
            if (!exists) {
                return {
                    exists: false,
                    vectorCount: 0,
                    dimension: this.vectorConfig.dimension,
                    metric: this.vectorConfig.metric,
                };
            }
            const stats = await this.client.getCollectionStatistics({
                collection_name: collectionName,
            });
            const describe = await this.client.describeCollection({
                collection_name: collectionName,
            });
            const fields = describe.schema?.fields || [];
            return {
                exists: true,
                vectorCount: parseInt(stats.data.total_vector_count || '0', 10),
                dimension: this.vectorConfig.dimension,
                metric: this.vectorConfig.metric,
                indexType: undefined,
            };
        }
        catch (error) {
            this.logger.error(`获取索引状态失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async dropCollection(collectionName) {
        this.ensureInitialized();
        try {
            await this.client.dropCollection({ collection_name: collectionName });
            this.logger.log(`删除 Milvus 集合: ${collectionName}`);
        }
        catch (error) {
            this.logger.error(`删除集合失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async checkHealth() {
        const startTime = Date.now();
        try {
            this.ensureInitialized();
            const health = await this.client.checkHealth();
            return {
                healthy: health.isHealthy || false,
                provider: this.name,
                latency: Date.now() - startTime,
                details: {
                    isHealthy: health.isHealthy,
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
            totalCollections: 0,
            queryLatency: this.metrics.queryCount > 0 ? this.metrics.totalQueryLatency / this.metrics.queryCount : 0,
            insertLatency: this.metrics.insertCount > 0 ? this.metrics.totalInsertLatency / this.metrics.insertCount : 0,
            avgLatency: (this.metrics.totalQueryLatency + this.metrics.totalInsertLatency) / (this.metrics.queryCount + this.metrics.insertCount) || 0,
        };
    }
    async disconnect() {
        if (this.client) {
            await this.client.closeConnection();
            this.client = null;
            this.initialized = false;
            this.logger.log('Milvus 连接已关闭');
        }
    }
    ensureInitialized() {
        if (!this.initialized || !this.client) {
            throw new Error('Milvus 提供者未初始化，请先调用 initialize()');
        }
    }
    async ensureCollectionExists(name) {
        const exists = await this.client.hasCollection({ collection_name: name });
        if (!exists) {
            await this.getCollection(name);
        }
    }
    getMilvusMetricType(metric) {
        switch (metric.toUpperCase()) {
            case 'COSINE':
                return 1;
            case 'IP':
                return 2;
            case 'L2':
                return 0;
            default:
                return 1;
        }
    }
};
exports.MilvusProvider = MilvusProvider;
exports.MilvusProvider = MilvusProvider = MilvusProvider_1 = __decorate([
    (0, common_1.Injectable)()
], MilvusProvider);
//# sourceMappingURL=milvus.provider.js.map