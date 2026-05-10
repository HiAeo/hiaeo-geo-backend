/**
 * 连接池服务
 * 管理向量数据库连接，支持多租户
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { IVectorProvider } from '../interfaces/vector-provider.interface';
import { VectorDbFactory } from './vector-db-factory.service';
import { vectorDbConfig } from '../config/vector-db.config';

interface PoolEntry {
  provider: IVectorProvider;
  createdAt: Date;
  lastUsed: Date;
  inUse: boolean;
}

@Injectable()
export class ConnectionPool implements OnModuleDestroy {
  private readonly logger = new Logger(ConnectionPool.name);
  private pool: Map<string, PoolEntry> = new Map();
  private readonly maxConnections: number;
  private readonly connectionTimeout: number;

  constructor() {
    this.maxConnections = vectorDbConfig.pool.maxConnections;
    this.connectionTimeout = vectorDbConfig.pool.connectionTimeout;
    this.logger.log(`连接池初始化，最大连接数: ${this.maxConnections}`);
  }

  /**
   * 获取连接
   * @param key 连接标识
   */
  async getConnection(key: string): Promise<IVectorProvider> {
    // 检查是否存在可用连接
    let entry = this.pool.get(key);

    if (entry) {
      entry.lastUsed = new Date();
      entry.inUse = true;
      return entry.provider;
    }

    // 检查连接池是否已满
    if (this.pool.size >= this.maxConnections) {
      // 释放最久未使用的连接
      await this.releaseLeastUsed();
    }

    // 创建新连接
    const provider = VectorDbFactory.createProvider();
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

  /**
   * 释放连接（标记为可用但不关闭）
   * @param key 连接标识
   */
  async releaseConnection(key: string): Promise<void> {
    const entry = this.pool.get(key);
    if (entry) {
      entry.inUse = false;
      this.logger.debug(`释放连接: ${key}`);
    }
  }

  /**
   * 关闭并移除连接
   * @param key 连接标识
   */
  async closeConnection(key: string): Promise<void> {
    const entry = this.pool.get(key);
    if (entry) {
      try {
        await entry.provider.disconnect();
        this.pool.delete(key);
        this.logger.debug(`关闭连接: ${key}`);
      } catch (error) {
        this.logger.error(`关闭连接失败: ${key}, ${error.message}`);
        this.pool.delete(key);
      }
    }
  }

  /**
   * 获取当前连接池状态
   */
  getPoolStatus(): {
    totalConnections: number;
    availableConnections: number;
    usedConnections: number;
    connections: { key: string; inUse: boolean; createdAt: Date; lastUsed: Date }[];
  } {
    const connections: { key: string; inUse: boolean; createdAt: Date; lastUsed: Date }[] = [];

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

  /**
   * 释放最久未使用的连接
   */
  private async releaseLeastUsed(): Promise<void> {
    let oldestKey: string | null = null;
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

  /**
   * 清空连接池
   */
  async clear(): Promise<void> {
    for (const key of this.pool.keys()) {
      await this.closeConnection(key);
    }
    this.pool.clear();
    this.logger.log('连接池已清空');
  }

  /**
   * 模块销毁时清理连接池
   */
  async onModuleDestroy(): Promise<void> {
    await this.clear();
  }
}
