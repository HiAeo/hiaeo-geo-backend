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
var ConnectionPool_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = void 0;
const common_1 = require("@nestjs/common");
const vector_db_factory_service_1 = require("./vector-db-factory.service");
const vector_db_config_1 = require("../config/vector-db.config");
let ConnectionPool = ConnectionPool_1 = class ConnectionPool {
    constructor() {
        this.logger = new common_1.Logger(ConnectionPool_1.name);
        this.pool = new Map();
        this.maxConnections = vector_db_config_1.vectorDbConfig.pool.maxConnections;
        this.connectionTimeout = vector_db_config_1.vectorDbConfig.pool.connectionTimeout;
        this.logger.log(`连接池初始化，最大连接数: ${this.maxConnections}`);
    }
    async getConnection(key) {
        let entry = this.pool.get(key);
        if (entry) {
            entry.lastUsed = new Date();
            entry.inUse = true;
            return entry.provider;
        }
        if (this.pool.size >= this.maxConnections) {
            await this.releaseLeastUsed();
        }
        const provider = vector_db_factory_service_1.VectorDbFactory.createProvider();
        await provider.initialize();
        entry = {
            provider,
            createdAt: new Date(),
            lastUsed: new Date(),
            inUse: true,
        };
        this.pool.set(key, entry);
        this.logger.debug(`创建新连接: ${key}，当前连接数: ${this.pool.size}`);
        return provider;
    }
    async releaseConnection(key) {
        const entry = this.pool.get(key);
        if (entry) {
            entry.inUse = false;
            this.logger.debug(`释放连接: ${key}`);
        }
    }
    async closeConnection(key) {
        const entry = this.pool.get(key);
        if (entry) {
            try {
                await entry.provider.disconnect();
                this.pool.delete(key);
                this.logger.debug(`关闭连接: ${key}`);
            }
            catch (error) {
                this.logger.error(`关闭连接失败: ${key}, ${error.message}`);
                this.pool.delete(key);
            }
        }
    }
    getPoolStatus() {
        const connections = [];
        for (const [key, entry] of this.pool.entries()) {
            connections.push({
                key,
                inUse: entry.inUse,
                createdAt: entry.createdAt,
                lastUsed: entry.lastUsed,
            });
        }
        return {
            totalConnections: this.pool.size,
            availableConnections: connections.filter((c) => !c.inUse).length,
            usedConnections: connections.filter((c) => c.inUse).length,
            connections,
        };
    }
    async releaseLeastUsed() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of this.pool.entries()) {
            if (!entry.inUse && entry.lastUsed.getTime() < oldestTime) {
                oldestTime = entry.lastUsed.getTime();
                oldestKey = key;
            }
        }
        if (oldestKey) {
            await this.closeConnection(oldestKey);
            this.logger.debug(`释放最久未使用的连接: ${oldestKey}`);
        }
    }
    async clear() {
        for (const key of this.pool.keys()) {
            await this.closeConnection(key);
        }
        this.pool.clear();
        this.logger.log('连接池已清空');
    }
    async onModuleDestroy() {
        await this.clear();
    }
};
exports.ConnectionPool = ConnectionPool;
exports.ConnectionPool = ConnectionPool = ConnectionPool_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ConnectionPool);
//# sourceMappingURL=connection-pool.service.js.map