/**
 * 向量数据库健康检查服务
 */

import { Injectable, Logger } from '@nestjs/common';
import { IVectorProvider } from '../interfaces/vector-provider.interface';
import { VectorDbFactory } from './vector-db-factory.service';
import { HealthStatus, VectorMetrics, CollectionStats } from '../interfaces/vector-provider.interface';

@Injectable()
export class VectorHealthService {
  private readonly logger = new Logger(VectorHealthService.name);

  /**
   * 检查向量数据库健康状态
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const provider = VectorDbFactory.getDefaultProvider();

      if (!provider.isInitialized()) {
        await provider.initialize();
      }

      return await provider.checkHealth();
    } catch (error) {
      return {
        healthy: false,
        provider: VectorDbFactory.getProviderName(),
        error: error.message,
      };
    }
  }

  /**
   * 获取性能指标
   */
  async getMetrics(): Promise<VectorMetrics> {
    try {
      const provider = VectorDbFactory.getDefaultProvider();

      if (!provider.isInitialized()) {
        await provider.initialize();
      }

      return await provider.getMetrics();
    } catch (error) {
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

  /**
   * 获取集合统计信息
   * @param collectionName 集合名称
   */
  async getCollectionStats(collectionName: string): Promise<CollectionStats> {
    try {
      const provider = VectorDbFactory.getDefaultProvider();

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
    } catch (error) {
      this.logger.error(`获取集合统计失败: ${error.message}`);
      return {
        name: collectionName,
        vectorCount: 0,
        dimension: 1536,
      };
    }
  }

  /**
   * 检查所有集合健康状态
   * @param collectionNames 集合名称列表
   */
  async checkAllCollections(collectionNames: string[]): Promise<{
    healthy: boolean;
    collections: CollectionStats[];
    errors: string[];
  }> {
    const results: CollectionStats[] = [];
    const errors: string[] = [];
    let allHealthy = true;

    for (const name of collectionNames) {
      try {
        const stats = await this.getCollectionStats(name);
        results.push(stats);
      } catch (error) {
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
}
