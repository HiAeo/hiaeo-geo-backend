import { ConfigService } from '../../../config/config.service';
import { PublishPlatform } from '../dto/publish.dto';
export interface PlatformConfig {
    enabled: boolean;
    config: Record<string, string>;
}
export declare class PlatformConfigService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getAllConfigs(): Record<PublishPlatform, PlatformConfig>;
    getPlatformConfig(platform: PublishPlatform): PlatformConfig;
    isPlatformConfigured(platform: PublishPlatform): boolean;
    getConfiguredPlatforms(): PublishPlatform[];
    private getWebsiteConfig;
    private getWechatConfig;
    private getWechatMomentsConfig;
    private getWeiboConfig;
    private getDouyinConfig;
    private getXiaohongshuConfig;
    private getBilibiliConfig;
    private getBaiduConfig;
    private getTaobaoConfig;
    private getTmallConfig;
    private getJdConfig;
    private getCustomConfig;
}
