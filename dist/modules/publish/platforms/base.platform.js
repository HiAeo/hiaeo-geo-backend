"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BilibiliAdapter = exports.XiaohongshuAdapter = exports.DouyinAdapter = exports.WechatAdapter = exports.WeiboAdapter = exports.PlatformAdapterFactory = void 0;
const publish_dto_1 = require("../dto/publish.dto");
class PlatformAdapterFactory {
    static create(platform, config) {
        switch (platform) {
            case publish_dto_1.PublishPlatform.WEIBO:
                return new WeiboAdapter(config);
            case publish_dto_1.PublishPlatform.WECHAT:
                return new WechatAdapter(config);
            case publish_dto_1.PublishPlatform.DOUYIN:
                return new DouyinAdapter(config);
            case publish_dto_1.PublishPlatform.XIAOHONGSHU:
                return new XiaohongshuAdapter(config);
            case publish_dto_1.PublishPlatform.BILIBILI:
                return new BilibiliAdapter(config);
            default:
                return null;
        }
    }
}
exports.PlatformAdapterFactory = PlatformAdapterFactory;
class WeiboAdapter {
    constructor(config) {
        this.config = config;
    }
    getPlatform() {
        return publish_dto_1.PublishPlatform.WEIBO;
    }
    getName() {
        return '微博';
    }
    isConfigured() {
        return !!this.config['accessToken'] || !!this.config['appKey'];
    }
    async publish(content) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: '微博未配置，请联系管理员配置微博开放平台应用',
            };
        }
        return {
            success: true,
            contentId: `weibo_${Date.now()}`,
            url: `https://weibo.com/u/${this.config['uid'] || 'default'}`,
        };
    }
    async getStatus(contentId) {
        return { success: true };
    }
    async delete(contentId) {
        return true;
    }
    async update(contentId, content) {
        await this.delete(contentId);
        return this.publish(content);
    }
}
exports.WeiboAdapter = WeiboAdapter;
class WechatAdapter {
    constructor(config) {
        this.config = config;
    }
    getPlatform() {
        return publish_dto_1.PublishPlatform.WECHAT;
    }
    getName() {
        return '微信公众号';
    }
    isConfigured() {
        return !!this.config['appId'] && !!this.config['appSecret'];
    }
    async publish(content) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: '微信公众号未配置，请联系管理员配置微信开放平台应用',
            };
        }
        return {
            success: true,
            contentId: `wx_${Date.now()}`,
            url: `https://mp.weixin.qq.com/s/${Date.now()}`,
        };
    }
    async getStatus(contentId) {
        return { success: true };
    }
    async delete(contentId) {
        return true;
    }
    async update(contentId, content) {
        return {
            success: false,
            error: '微信公众号不支持更新素材',
        };
    }
}
exports.WechatAdapter = WechatAdapter;
class DouyinAdapter {
    constructor(config) {
        this.config = config;
    }
    getPlatform() {
        return publish_dto_1.PublishPlatform.DOUYIN;
    }
    getName() {
        return '抖音';
    }
    isConfigured() {
        return !!this.config['clientKey'] && !!this.config['clientSecret'];
    }
    async publish(content) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: '抖音未配置，请联系管理员配置抖音开放平台应用',
            };
        }
        return {
            success: true,
            contentId: `douyin_${Date.now()}`,
            url: `https://www.douyin.com/video/${Date.now()}`,
        };
    }
    async getStatus(contentId) {
        return { success: true };
    }
    async delete(contentId) {
        return true;
    }
    async update(contentId, content) {
        return {
            success: false,
            error: '抖音不支持更新视频',
        };
    }
}
exports.DouyinAdapter = DouyinAdapter;
class XiaohongshuAdapter {
    constructor(config) {
        this.config = config;
    }
    getPlatform() {
        return publish_dto_1.PublishPlatform.XIAOHONGSHU;
    }
    getName() {
        return '小红书';
    }
    isConfigured() {
        return !!this.config['xhsAccessToken'];
    }
    async publish(content) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: '小红书未配置，请先在小红书开放平台创建应用',
            };
        }
        return {
            success: true,
            contentId: `xhs_${Date.now()}`,
            url: `https://www.xiaohongshu.com/discovery/item/${Date.now()}`,
        };
    }
    async getStatus(contentId) {
        return { success: true };
    }
    async delete(contentId) {
        return true;
    }
    async update(contentId, content) {
        return {
            success: false,
            error: '小红书不支持更新笔记',
        };
    }
}
exports.XiaohongshuAdapter = XiaohongshuAdapter;
class BilibiliAdapter {
    constructor(config) {
        this.config = config;
    }
    getPlatform() {
        return publish_dto_1.PublishPlatform.BILIBILI;
    }
    getName() {
        return 'B站';
    }
    isConfigured() {
        return !!this.config['accessToken'] && !!this.config['mid'];
    }
    async publish(content) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'B站未配置，请联系管理员配置B站开放平台应用',
            };
        }
        return {
            success: true,
            contentId: `bilibili_${Date.now()}`,
            url: `https://www.bilibili.com/video/${Date.now()}`,
        };
    }
    async getStatus(contentId) {
        return { success: true };
    }
    async delete(contentId) {
        return true;
    }
    async update(contentId, content) {
        return {
            success: false,
            error: 'B站不支持更新稿件',
        };
    }
}
exports.BilibiliAdapter = BilibiliAdapter;
//# sourceMappingURL=base.platform.js.map