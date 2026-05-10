import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyStatus } from '../entities/api-key.entity';
import { ApiUsageLog } from '../entities/api-usage-log.entity';

@Injectable()
export class ApiGatewayMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiGatewayMiddleware.name);

  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(ApiUsageLog)
    private usageLogRepository: Repository<ApiUsageLog>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 跳过非API路由
    if (!req.path.startsWith('/api/')) {
      return next();
    }

    // 提取API Key和Secret
    const apiKey = req.headers['x-api-key'] as string || req.query['api_key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string || req.query['api_secret'] as string;
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    // 如果没有API Key，跳过验证（让其他认证机制处理）
    if (!apiKey) {
      return next();
    }

    try {
      // 验证API Key
      const keyRecord = await this.validateApiKey(apiKey);
      
      if (!keyRecord) {
        throw new HttpException('无效的API Key', HttpStatus.UNAUTHORIZED);
      }

      // 验证签名
      if (signature && timestamp) {
        const isValidSignature = this.validateSignature(keyRecord, req, timestamp, signature);
        if (!isValidSignature) {
          throw new HttpException('签名验证失败', HttpStatus.UNAUTHORIZED);
        }
      }

      // 检查频率限制
      await this.checkRateLimit(keyRecord, req);

      // 记录使用日志
      await this.logUsage(keyRecord, req);

      // 将API Key信息附加到请求
      (req as any).apiKey = keyRecord;

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`API验证失败: ${error.message}`, error.stack);
      throw new HttpException('API验证失败', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * 验证API Key
   */
  private async validateApiKey(key: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key },
      relations: ['organization'],
    });

    if (!apiKey) {
      return null;
    }

    // 检查状态
    if (apiKey.status !== ApiKeyStatus.ACTIVE) {
      throw new HttpException(`API Key已被${apiKey.status === ApiKeyStatus.REVOKED ? '吊销' : '暂停'}`, HttpStatus.FORBIDDEN);
    }

    // 检查过期
    if (apiKey.isExpired()) {
      apiKey.status = ApiKeyStatus.EXPIRED;
      await this.apiKeyRepository.save(apiKey);
      throw new HttpException('API Key已过期', HttpStatus.FORBIDDEN);
    }

    return apiKey;
  }

  /**
   * 验证签名
   */
  private validateSignature(apiKey: ApiKey, req: Request, timestamp: string, signature: string): boolean {
    // 验证时间戳（5分钟窗口）
    const now = Date.now();
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 5 * 60 * 1000) {
      return false;
    }

    // 构建签名字符串
    const method = req.method.toUpperCase();
    const path = req.path;
    const body = req.body ? JSON.stringify(req.body) : '';
    const stringToSign = `${method}${path}${timestamp}${body}`;

    // 使用HMAC-SHA256签名
    const expectedSignature = crypto
      .createHmac('sha256', apiKey.secret)
      .update(stringToSign)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * 检查频率限制
   */
  private async checkRateLimit(apiKey: ApiKey, req: Request): Promise<void> {
    const now = new Date();
    const startOfMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

    // 获取当前分钟请求数
    const requestCount = await this.usageLogRepository.count({
      where: {
        apiKeyId: apiKey.id,
        createdAt: MoreThan(startOfMinute),
      },
    });

    if (apiKey.rateLimit > 0 && requestCount >= apiKey.rateLimit) {
      throw new HttpException('请求过于频繁，请稍后再试', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  /**
   * 记录使用日志
   */
  private async logUsage(apiKey: ApiKey, req: Request): Promise<void> {
    const log = this.usageLogRepository.create({
      apiKeyId: apiKey.id,
      organizationId: apiKey.organizationId,
      endpoint: req.path,
      method: req.method,
      statusCode: 200,
      ip: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    await this.usageLogRepository.save(log);
  }
}

/**
 * API作用域守卫
 */
@Injectable()
export class ApiScopeGuard {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  canActivate(requiredScopes: string[]): boolean {
    // TODO: 从请求中获取API Key并验证作用域
    return true;
  }
}
