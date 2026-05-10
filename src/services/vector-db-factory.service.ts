/**
 * 向量数据库工厂服务
 * 根据配置创建相应的向量数据库提供者
 */

import { Injectable, Logger } from '@nestjs/common';
import { IVectorProvider } from '../interfaces/vector-provider.interface';
import { vectorDbConfig, VectorDbProvider } from '../config/vector-db.config';
import { MilvusProvider } from './vector-providers/milvus.provider';
import { PineconeProvider } from './vector-providers/pinecone.provider';
import { InMemoryProvider } from './vector-providers/in-memory.provider';

@Injectable()
export class VectorDbFactory {
  private readonly logger = new Logger(VectorDbFactory.name);

  /**
   * 创建向量数据库提供者
   * @param type 提供者类型，默认使用配置中的类型
   */
  static createProvider(type?: VectorDbProvider): IVectorProvider {
    const providerType = type || vectorDbConfig.provider;

    switch (providerType) {
      case 'milvus':
        return new MilvusProvider();
      case 'pinecone':
        return new PineconeProvider();
      case 'qdrant':
        // Qdrant 暂时使用内存提供者作为占位
        this.logWarning('qdrant', '使用内存提供者作为占位实现');
        return new InMemoryProvider();
      case 'memory':
      default:
        return new InMemoryProvider();
    }
  }

  /**
   * 获取默认提供者
   */
  static getDefaultProvider(): IVectorProvider {
    return this.createProvider();
  }

  /**
   * 获取当前配置的提供者名称
   */
  static getProviderName(): string {
    return vectorDbConfig.provider;
  }

  /**
   * 检查是否使用生产级向量数据库
   */
  static isProductionProvider(): boolean {
    const provider = vectorDbConfig.provider;
    return provider === 'milvus' || provider === 'pinecone' || provider === 'qdrant';
  }

  /**
   * 获取提供者配置信息（脱敏）
   */
  static getSafeConfig(): Record<string, any> {
    const config = { ...vectorDbConfig };
    const safeConfig: Record<string, any> = {
      provider: config.provider,
      vector: config.vector,
      pool: config.pool,
      fallback: config.fallback,
    };

    // 脱敏敏感信息
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

  private static logWarning(provider: string, message: string): void {
    const logger = new Logger(`VectorDbFactory[${provider}]`);
    logger.warn(message);
  }
}
