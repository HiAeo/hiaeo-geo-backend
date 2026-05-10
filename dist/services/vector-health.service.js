"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VectorHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorHealthService = void 0;
const common_1 = require("@nestjs/common");
const vector_db_factory_service_1 = require("./vector-db-factory.service");
let VectorHealthService = VectorHealthService_1 = class VectorHealthService {
    constructor() {
        this.logger = new common_1.Logger(VectorHealthService_1.name);
    }
    async checkHealth() {
        try {
            const provider = vector_db_factory_service_1.VectorDbFactory.getDefaultProvider();
            if (!provider.isInitialized()) {
                await provider.initialize();
            }
            return await provider.checkHealth();
        }
        catch (error) {
            return {
                healthy: false,
                provider: vector_db_factory_service_1.VectorDbFactory.getProviderName(),
                error: error.message,
            };
        }
    }
    async getMetrics() {
        try {
            const provider = vector_db_factory_service_1.VectorDbFactory.getDefaultProvider();
            if (!provider.isInitialized()) {
                await provider.initialize();
            }
            return await provider.getMetrics();
        }
        catch (error) {
            this.logger.error(`获取性能指标失败: ${error.message}`);
            return {
                totalVectors: 0,
                totalCollections: 0,
                queryLatency: 0,
                insertLatency: 0,
                avgLatency: 0,
            };
        }
    }
    async getCollectionStats(collectionName) {
        try {
            const provider = vector_db_factory_service_1.VectorDbFactory.getDefaultProvider();
            if (!provider.isInitialized()) {
                await provider.initialize();
            }
            const status = await provider.getIndexStatus(collectionName);
            return {
                name: collectionName,
                vectorCount: status.vectorCount,
                dimension: status.dimension,
                lastUpdated: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`获取集合统计失败: ${error.message}`);
            return {
                name: collectionName,
                vectorCount: 0,
                dimension: 1536,
            };
        }
    }
    async checkAllCollections(collectionNames) {
        const results = [];
        const errors = [];
        let allHealthy = true;
        for (const name of collectionNames) {
            try {
                const stats = await this.getCollectionStats(name);
                results.push(stats);
            }
            catch (error) {
                errors.push(`${name}: ${error.message}`);
                allHealthy = false;
            }
        }
        return {
            healthy: allHealthy,
            collections: results,
            errors,
        };
    }
};
exports.VectorHealthService = VectorHealthService;
exports.VectorHealthService = VectorHealthService = VectorHealthService_1 = __decorate([
    (0, common_1.Injectable)()
], VectorHealthService);
//# sourceMappingURL=vector-health.service.js.map