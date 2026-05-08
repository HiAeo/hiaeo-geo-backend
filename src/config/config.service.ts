import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly env: Record<string, string | undefined>;

  constructor() {
    this.env = process.env;
  }

  get(key: string, defaultValue?: string): string {
    return this.env[key] || defaultValue || '';
  }

  getNumber(key: string, defaultValue?: number): number {
    const value = this.env[key];
    return value ? parseInt(value, 10) : defaultValue || 0;
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.env[key];
    if (value === undefined) return defaultValue || false;
    return value === 'true' || value === '1';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  getDeepseekApiKey(): string {
    return this.get('DEEPSEEK_API_KEY');
  }

  getKimiApiKey(): string {
    return this.get('KIMI_API_KEY');
  }

  getQwenApiKey(): string {
    return this.get('QWEN_API_KEY');
  }

  getZhipuApiKey(): string {
    return this.get('ZHIPU_API_KEY');
  }

  getDoubaoApiKey(): string {
    return this.get('DOUBAO_API_KEY');
  }

  getWenxinApiKey(): string {
    return this.get('WENXIN_API_KEY');
  }

  getWenxinSecretKey(): string {
    return this.get('WENXIN_SECRET_KEY');
  }

  getDefaultAiEngine(): string {
    return this.get('DEFAULT_AI_ENGINE', 'deepseek');
  }

  getPort(): number {
    return this.getNumber('PORT', 3000);
  }

  getJwtSecret(): string {
    return this.get('JWT_SECRET', 'default-secret-change-in-production');
  }

  getJwtExpiration(): string {
    return this.get('JWT_EXPIRATION', '7d');
  }
}
