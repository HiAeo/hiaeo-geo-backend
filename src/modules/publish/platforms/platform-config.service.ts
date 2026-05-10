import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import { PublishPlatform } from '../dto/publish.dto';

/**
 * 平台配置接口
 */
export interface PlatformConfig {
  enabled: boolean;
  config: Record<string, string>;
}

/**
 * 平台配置服务
 */
@Injectable()
export class PlatformConfigService {
  private readonly logger = new Logger(PlatformConfigService.name);

  constructor(private configService: ConfigService) {}

  /**
   * 获取所有平台配置
   */
  getAllConfigs(): Record<PublishPlatform, PlatformConfig> {
    return {
      [PublishPlatform.WEBSITE]: this.getWebsiteConfig(),
      [PublishPlatform.WECHAT]: this.getWechatConfig(),
      [PublishPlatform.WECHAT_MOMENTS]: this.getWechatMomentsConfig(),
      [PublishPlatform.WEIBO]: this.getWeiboConfig(),
      [PublishPlatform.DOUYIN]: this.getDouyinConfig(),
      [PublishPlatform.XIAOHONGSHU]: this.getXiaohongshuConfig(),
      [PublishPlatform.BILIBILI]: this.getBilibiliConfig(),
      [PublishPlatform.BAIDU]: this.getBaiduConfig(),
      [PublishPlatform.TAOBAO]: this.getTaobaoConfig(),
      [PublishPlatform.TMALL]: this.getTmallConfig(),
      [PublishPlatform.JD]: this.getJdConfig(),
      [PublishPlatform.CUSTOM]: this.getCustomConfig(),
    };
  }

  /**
   * 获取单个平台配置
   */
  getPlatformConfig(platform: PublishPlatform): PlatformConfig {
    const configs = this.getAllConfigs();
    return configs[platform] || { enabled: false, config: {} };
  }

  /**
   * 检查平台是否已配置
   */
  isPlatformConfigured(platform: PublishPlatform): boolean {
    const config = this.getPlatformConfig(platform);
    return config.enabled && Object.keys(config.config).length > 0;
  }

  /**
   * 获取已配置的平台列表
   */
  getConfiguredPlatforms(): PublishPlatform[] {
    const allConfigs = this.getAllConfigs();
    return Object.entries(allConfigs)
      .filter(([_, config]) => config.enabled)
      .map(([platform]) => platform as PublishPlatform);
  }

  // 各平台配置获取方法

  private getWebsiteConfig(): PlatformConfig {
    return {
      enabled: true, // 官网始终可用
      config: {
        websiteUrl: this.configService.get('WEBSITE_URL') || '',
      },
    };
  }

  private getWechatConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('WECHAT_APP_ID'),
      config: {
        appId: this.configService.get('WECHAT_APP_ID') || '',
        appSecret: this.configService.get('WECHAT_APP_SECRET') || '',
      },
    };
  }

  private getWechatMomentsConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('WECHAT_APP_ID'),
      config: {
        appId: this.configService.get('WECHAT_APP_ID') || '',
        appSecret: this.configService.get('WECHAT_APP_SECRET') || '',
      },
    };
  }

  private getWeiboConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('WEIBO_APP_KEY'),
      config: {
        appKey: this.configService.get('WEIBO_APP_KEY') || '',
        appSecret: this.configService.get('WEIBO_APP_SECRET') || '',
        accessToken: this.configService.get('WEIBO_ACCESS_TOKEN') || '',
        uid: this.configService.get('WEIBO_UID') || '',
      },
    };
  }

  private getDouyinConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('DOUYIN_CLIENT_KEY'),
      config: {
        clientKey: this.configService.get('DOUYIN_CLIENT_KEY') || '',
        clientSecret: this.configService.get('DOUYIN_CLIENT_SECRET') || '',
        accessToken: this.configService.get('DOUYIN_ACCESS_TOKEN') || '',
      },
    };
  }

  private getXiaohongshuConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('XHS_ACCESS_TOKEN'),
      config: {
        accessToken: this.configService.get('XHS_ACCESS_TOKEN') || '',
        deviceId: this.configService.get('XHS_DEVICE_ID') || '',
      },
    };
  }

  private getBilibiliConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('BILIBILI_ACCESS_TOKEN'),
      config: {
        accessToken: this.configService.get('BILIBILI_ACCESS_TOKEN') || '',
        refreshToken: this.configService.get('BILIBILI_REFRESH_TOKEN') || '',
        mid: this.configService.get('BILIBILI_MID') || '',
      },
    };
  }

  private getBaiduConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('BAIDU_API_KEY'),
      config: {
        apiKey: this.configService.get('BAIDU_API_KEY') || '',
        secretKey: this.configService.get('BAIDU_SECRET_KEY') || '',
      },
    };
  }

  private getTaobaoConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('TAOBAO_APP_KEY'),
      config: {
        appKey: this.configService.get('TAOBAO_APP_KEY') || '',
        appSecret: this.configService.get('TAOBAO_APP_SECRET') || '',
        sessionKey: this.configService.get('TAOBAO_SESSION_KEY') || '',
      },
    };
  }

  private getTmallConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('TMALL_APP_KEY'),
      config: {
        appKey: this.configService.get('TMALL_APP_KEY') || '',
        appSecret: this.configService.get('TMALL_APP_SECRET') || '',
        sessionKey: this.configService.get('TMALL_SESSION_KEY') || '',
      },
    };
  }

  private getJdConfig(): PlatformConfig {
    return {
      enabled: !!this.configService.get('JD_APP_KEY'),
      config: {
        appKey: this.configService.get('JD_APP_KEY') || '',
        appSecret: this.configService.get('JD_APP_SECRET') || '',
        accessToken: this.configService.get('JD_ACCESS_TOKEN') || '',
      },
    };
  }

  private getCustomConfig(): PlatformConfig {
    return {
      enabled: true,
      config: {
        webhookUrl: this.configService.get('CUSTOM_WEBHOOK_URL') || '',
      },
    };
  }
}
