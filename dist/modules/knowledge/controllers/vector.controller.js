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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vector_health_service_1 = require("../../../services/vector-health.service");
const vector_db_factory_service_1 = require("../../../services/vector-db-factory.service");
const vector_storage_service_1 = require("../services/vector-storage.service");
let VectorController = class VectorController {
    constructor(healthService, storageService) {
        this.healthService = healthService;
        this.storageService = storageService;
    }
    async checkHealth() {
        return await this.healthService.checkHealth();
    }
    async getMetrics() {
        return await this.healthService.getMetrics();
    }
    async getStats(collection) {
        return await this.healthService.getCollectionStats(collection || 'brand_knowledge_embeddings');
    }
    getConfig() {
        return vector_db_factory_service_1.VectorDbFactory.getSafeConfig();
    }
    async getStorageStats() {
        return await this.storageService.getStorageStats();
    }
    async rebuildCollection(body) {
        if (body.organizationIds && body.organizationIds.length > 0) {
            return await this.storageService.batchIndex(body.organizationIds);
        }
        return { message: '请提供 organizationIds 列表' };
    }
    async checkAllCollections(collections) {
        const collectionNames = collections
            ? collections.split(',')
            : ['brand_knowledge_embeddings'];
        return await this.healthService.checkAllCollections(collectionNames);
    }
};
exports.VectorController = VectorController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: '向量数据库健康检查' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '健康状态' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VectorController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: '获取性能指标' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '性能指标' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VectorController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取集合统计' }),
    (0, swagger_1.ApiQuery)({ name: 'collection', required: false, description: '集合名称' }),
    __param(0, (0, common_1.Query)('collection')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VectorController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前向量数据库配置' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '配置信息' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VectorController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('storage'),
    (0, swagger_1.ApiOperation)({ summary: '获取存储统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '存储统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VectorController.prototype, "getStorageStats", null);
__decorate([
    (0, common_1.Post)('collection/rebuild'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '重建集合索引' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '重建结果' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VectorController.prototype, "rebuildCollection", null);
__decorate([
    (0, common_1.Get)('collections'),
    (0, swagger_1.ApiOperation)({ summary: '检查所有集合状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '集合状态列表' }),
    __param(0, (0, common_1.Query)('collections')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VectorController.prototype, "checkAllCollections", null);
exports.VectorController = VectorController = __decorate([
    (0, swagger_1.ApiTags)('向量数据库'),
    (0, common_1.Controller)('v1/vector'),
    __metadata("design:paramtypes", [vector_health_service_1.VectorHealthService,
        vector_storage_service_1.VectorStorageService])
], VectorController);
//# sourceMappingURL=vector.controller.js.map