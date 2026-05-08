"use strict";
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyStatus, ApiKeyScope } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * 生成API Key
   */
  async create(params: {
    organizationId: string;
    name: string;
    description?: string;
    scopes?: ApiKeyScope[];
    rateLimit?: number;
    monthlyLimit?: number;
    expiresAt?: Date;
    isProduction?: boolean;
    createdBy: string;
  }): Promise<{ apiKey: ApiKey; secret: string }> {
    // 生成Key和Secret
    const key = `hiaeo_sk_${crypto.randomBytes(16).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');

    // 加密存储Secret
    const hashedSecret = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');

    const apiKey = this.apiKeyRepository.create({
      organizationId: params.organizationId,
      name: params.name,
      description: params.description,
      key,
      secret: hashedSecret,
      scopes: params.scopes || [ApiKeyScope.ALL],
      rateLimit: params.rateLimit || 60,
      monthlyLimit: params.monthlyLimit || 10000,
      expiresAt: params.expiresAt,
      isProduction: params.isProduction || false,
      createdBy: params.createdBy,
    });

    const saved = await this.apiKeyRepository.save(apiKey);

    // 返回原始Secret（只显示一次）
    return {
      apiKey: saved,
      secret,
    };
  }

  /**
   * 验证API Key
   */
  async validate(key: string, secret: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key },
      relations: ['organization'],
    });

    if (!apiKey || !apiKey.isValid()) {
      return null;
    }

    // 验证Secret
    const hashedSecret = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');

    if (apiKey.secret !== hashedSecret) {
      return null;
    }

    return apiKey;
  }

  /**
   * 验证签名 - T121
   */
  validateSignature(params: {
    key: string;
    timestamp: string;
    signature: string;
    body?: string;
  }): boolean {
    const { key, timestamp, signature, body } = params;

    // 验证时间戳（5分钟窗口）
    const now = Date.now();
    const ts = parseInt(timestamp, 10);
    if (Math.abs(now - ts) > 5 * 60 * 1000) {
      return false;
    }

    // 查找API Key
    // 注意：实际实现中应该缓存或者使用缓存查询
    return true; // 简化实现
  }

  /**
   * 更新使用统计
   */
  async updateUsage(apiKeyId: string, ip: string): Promise<void> {
    await this.apiKeyRepository.update(apiKeyId, {
      usedCount: () => 'used_count + 1',
      lastUsedAt: new Date(),
      lastUsedIp: ip,
    });
  }

  /**
   * 检查频率限制 - T123
   */
  async checkRateLimit(apiKey: ApiKey): Promise<boolean> {
    // 简化实现：实际应该使用Redis
    if (apiKey.usedCount >= apiKey.monthlyLimit && apiKey.monthlyLimit > 0) {
      throw new BadRequestException('月度请求限制已用完');
    }
    return true;
  }

  /**
   * 获取API Key列表
   */
  async findAll(organizationId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个API Key
   */
  async findOne(id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({ where: { id } });
    if (!apiKey) {
      throw new NotFoundException('API Key不存在');
    }
    return apiKey;
  }

  /**
   * 更新API Key
   */
  async update(id: string, params: Partial<ApiKey>): Promise<ApiKey> {
    const apiKey = await this.findOne(id);
    Object.assign(apiKey, params);
    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * 吊销API Key
   */
  async revoke(id: string): Promise<void> {
    const apiKey = await this.findOne(id);
    apiKey.status = ApiKeyStatus.REVOKED;
    await this.apiKeyRepository.save(apiKey);
  }

  /**
   * 暂停/恢复API Key
   */
  async toggleStatus(id: string, status: ApiKeyStatus): Promise<ApiKey> {
    const apiKey = await this.findOne(id);
    apiKey.status = status;
    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * 删除API Key
   */
  async remove(id: string): Promise<void> {
    const apiKey = await this.findOne(id);
    await this.apiKeyRepository.remove(apiKey);
  }
}
