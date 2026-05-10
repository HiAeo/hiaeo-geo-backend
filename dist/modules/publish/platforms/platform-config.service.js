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
var PlatformConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../config/config.service");
const publish_dto_1 = require("../dto/publish.dto");
let PlatformConfigService = PlatformConfigService_1 = class PlatformConfigService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PlatformConfigService_1.name);
    }
    getAllConfigs() {
        return {
            [publish_dto_1.PublishPlatform.WEBSITE]: this.getWebsiteConfig(),
            [publish_dto_1.PublishPlatform.WECHAT]: this.getWechatConfig(),
            [publish_dto_1.PublishPlatform.WECHAT_MOMENTS]: this.getWechatMomentsConfig(),
            [publish_dto_1.PublishPlatform.WEIBO]: this.getWeiboConfig(),
            [publish_dto_1.PublishPlatform.DOUYIN]: this.getDouyinConfig(),
            [publish_dto_1.PublishPlatform.XIAOHONGSHU]: this.getXiaohongshuConfig(),
            [publish_dto_1.PublishPlatform.BILIBILI]: this.getBilibiliConfig(),
            [publish_dto_1.PublishPlatform.BAIDU]: this.getBaiduConfig(),
            [publish_dto_1.PublishPlatform.TAOBAO]: this.getTaobaoConfig(),
            [publish_dto_1.PublishPlatform.TMALL]: this.getTmallConfig(),
            [publish_dto_1.PublishPlatform.JD]: this.getJdConfig(),
            [publish_dto_1.PublishPlatform.CUSTOM]: this.getCustomConfig(),
        };
    }
    getPlatformConfig(platform) {
        const configs = this.getAllConfigs();
        return configs[platform] || { enabled: false, config: {} };
    }
    isPlatformConfigured(platform) {
        const config = this.getPlatformConfig(platform);
        return config.enabled && Object.keys(config.config).length > 0;
    }
    getConfiguredPlatforms() {
        const allConfigs = this.getAllConfigs();
        return Object.entries(allConfigs)
            .filter(([_, config]) => config.enabled)
            .map(([platform]) => platform);
    }
    getWebsiteConfig() {
        return {
            enabled: true,
            config: {
                websiteUrl: this.configService.get('WEBSITE_URL') || '',
            },
        };
    }
    getWechatConfig() {
        return {
            enabled: !!this.configService.get('WECHAT_APP_ID'),
            config: {
                appId: this.configService.get('WECHAT_APP_ID') || '',
                appSecret: this.configService.get('WECHAT_APP_SECRET') || '',
            },
        };
    }
    getWechatMomentsConfig() {
        return {
            enabled: !!this.configService.get('WECHAT_APP_ID'),
            config: {
                appId: this.configService.get('WECHAT_APP_ID') || '',
                appSecret: this.configService.get('WECHAT_APP_SECRET') || '',
            },
        };
    }
    getWeiboConfig() {
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
    getDouyinConfig() {
        return {
            enabled: !!this.configService.get('DOUYIN_CLIENT_KEY'),
            config: {
                clientKey: this.configService.get('DOUYIN_CLIENT_KEY') || '',
                clientSecret: this.configService.get('DOUYIN_CLIENT_SECRET') || '',
                accessToken: this.configService.get('DOUYIN_ACCESS_TOKEN') || '',
            },
        };
    }
    getXiaohongshuConfig() {
        return {
            enabled: !!this.configService.get('XHS_ACCESS_TOKEN'),
            config: {
                accessToken: this.configService.get('XHS_ACCESS_TOKEN') || '',
                deviceId: this.configService.get('XHS_DEVICE_ID') || '',
            },
        };
    }
    getBilibiliConfig() {
        return {
            enabled: !!this.configService.get('BILIBILI_ACCESS_TOKEN'),
            config: {
                accessToken: this.configService.get('BILIBILI_ACCESS_TOKEN') || '',
                refreshToken: this.configService.get('BILIBILI_REFRESH_TOKEN') || '',
                mid: this.configService.get('BILIBILI_MID') || '',
            },
        };
    }
    getBaiduConfig() {
        return {
            enabled: !!this.configService.get('BAIDU_API_KEY'),
            config: {
                apiKey: this.configService.get('BAIDU_API_KEY') || '',
                secretKey: this.configService.get('BAIDU_SECRET_KEY') || '',
            },
        };
    }
    getTaobaoConfig() {
        return {
            enabled: !!this.configService.get('TAOBAO_APP_KEY'),
            config: {
                appKey: this.configService.get('TAOBAO_APP_KEY') || '',
                appSecret: this.configService.get('TAOBAO_APP_SECRET') || '',
                sessionKey: this.configService.get('TAOBAO_SESSION_KEY') || '',
            },
        };
    }
    getTmallConfig() {
        return {
            enabled: !!this.configService.get('TMALL_APP_KEY'),
            config: {
                appKey: this.configService.get('TMALL_APP_KEY') || '',
                appSecret: this.configService.get('TMALL_APP_SECRET') || '',
                sessionKey: this.configService.get('TMALL_SESSION_KEY') || '',
            },
        };
    }
    getJdConfig() {
        return {
            enabled: !!this.configService.get('JD_APP_KEY'),
            config: {
                appKey: this.configService.get('JD_APP_KEY') || '',
                appSecret: this.configService.get('JD_APP_SECRET') || '',
                accessToken: this.configService.get('JD_ACCESS_TOKEN') || '',
            },
        };
    }
    getCustomConfig() {
        return {
            enabled: true,
            config: {
                webhookUrl: this.configService.get('CUSTOM_WEBHOOK_URL') || '',
            },
        };
    }
};
exports.PlatformConfigService = PlatformConfigService;
exports.PlatformConfigService = PlatformConfigService = PlatformConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], PlatformConfigService);
//# sourceMappingURL=platform-config.service.js.map