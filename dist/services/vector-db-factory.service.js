"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VectorDbFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorDbFactory = void 0;
const common_1 = require("@nestjs/common");
const vector_db_config_1 = require("../config/vector-db.config");
const milvus_provider_1 = require("./vector-providers/milvus.provider");
const pinecone_provider_1 = require("./vector-providers/pinecone.provider");
const in_memory_provider_1 = require("./vector-providers/in-memory.provider");
let VectorDbFactory = VectorDbFactory_1 = class VectorDbFactory {
    constructor() {
        this.logger = new common_1.Logger(VectorDbFactory_1.name);
    }
    static createProvider(type) {
        const providerType = type || vector_db_config_1.vectorDbConfig.provider;
        switch (providerType) {
            case 'milvus':
                return new milvus_provider_1.MilvusProvider();
            case 'pinecone':
                return new pinecone_provider_1.PineconeProvider();
            case 'qdrant':
                this.logWarning('qdrant', '使用内存提供者作为占位实现');
                return new in_memory_provider_1.InMemoryProvider();
            case 'memory':
            default:
                return new in_memory_provider_1.InMemoryProvider();
        }
    }
    static getDefaultProvider() {
        return this.createProvider();
    }
    static getProviderName() {
        return vector_db_config_1.vectorDbConfig.provider;
    }
    static isProductionProvider() {
        const provider = vector_db_config_1.vectorDbConfig.provider;
        return provider === 'milvus' || provider === 'pinecone' || provider === 'qdrant';
    }
    static getSafeConfig() {
        const config = { ...vector_db_config_1.vectorDbConfig };
        const safeConfig = {
            provider: config.provider,
            vector: config.vector,
            pool: config.pool,
            fallback: config.fallback,
        };
        if (config.milvus) {
            safeConfig.milvus = {
                address: config.milvus.address,
                dbName: config.milvus.dbName,
                collectionName: config.milvus.collectionName,
                ssl: config.milvus.ssl,
            };
        }
        if (config.pinecone) {
            safeConfig.pinecone = {
                environment: config.pinecone.environment,
                indexName: config.pinecone.indexName,
            };
        }
        if (config.qdrant) {
            safeConfig.qdrant = {
                url: config.qdrant.url,
                collectionName: config.qdrant.collectionName,
            };
        }
        return safeConfig;
    }
    static logWarning(provider, message) {
        const logger = new common_1.Logger(`VectorDbFactory[${provider}]`);
        logger.warn(message);
    }
};
exports.VectorDbFactory = VectorDbFactory;
exports.VectorDbFactory = VectorDbFactory = VectorDbFactory_1 = __decorate([
    (0, common_1.Injectable)()
], VectorDbFactory);
//# sourceMappingURL=vector-db-factory.service.js.map