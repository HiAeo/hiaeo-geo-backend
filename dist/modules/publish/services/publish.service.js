"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishService = void 0;
const common_1 = require("@nestjs/common");
const publish_dto_1 = require("../dto/publish.dto");
let PublishService = class PublishService {
    constructor() {
        this.publishRecords = new Map();
    }
    async publishContent(dto) {
        const id = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const record = {
            id,
            title: dto.title,
            body: dto.body,
            excerpt: dto.excerpt,
            contentType: dto.contentType,
            keywords: dto.keywords,
            metaTitle: dto.metaTitle,
            metaDescription: dto.metaDescription,
            targetPlatforms: dto.targetPlatforms,
            brandId: dto.brandId,
            sourceContentId: dto.sourceContentId,
            status: publish_dto_1.PublishStatus.PENDING,
            platformResults: [],
            createdAt: new Date(),
        };
        const publishPromises = dto.targetPlatforms.map(platform => this.publishToPlatform(id, dto, platform));
        record.platformResults = await Promise.all(publishPromises);
        const hasFailure = record.platformResults.some(r => r.status === publish_dto_1.PublishStatus.FAILED);
        const allSuccess = record.platformResults.every(r => r.status === publish_dto_1.PublishStatus.PUBLISHED);
        if (hasFailure) {
            record.status = publish_dto_1.PublishStatus.FAILED;
        }
        else if (allSuccess) {
            record.status = publish_dto_1.PublishStatus.PUBLISHED;
            record.publishedAt = new Date();
        }
        else {
            record.status = publish_dto_1.PublishStatus.PUBLISHING;
        }
        this.publishRecords.set(id, record);
        return this.formatPublishResult(record);
    }
    async batchPublish(dto) {
        const results = [];
        let success = 0;
        let failed = 0;
        for (const contentId of dto.contentIds) {
            const mockContent = await this.getMockContent(contentId);
            if (!mockContent) {
                failed++;
                continue;
            }
            try {
                const result = await this.publishContent({
                    ...mockContent,
                    targetPlatforms: dto.targetPlatforms,
                });
                results.push(result);
                success++;
            }
            catch (e) {
                failed++;
            }
        }
        return {
            results,
            summary: { total: dto.contentIds.length, success, failed },
        };
    }
    async getPublishList(query) {
        let records = Array.from(this.publishRecords.values());
        if (query.brandId) {
            records = records.filter(r => r.brandId === query.brandId);
        }
        if (query.contentType) {
            records = records.filter(r => r.contentType === query.contentType);
        }
        if (query.status) {
            records = records.filter(r => r.status === query.status);
        }
        if (query.platform) {
            records = records.filter(r => r.platformResults.some(pr => pr.platform === query.platform));
        }
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        const total = records.length;
        const start = (page - 1) * pageSize;
        const list = records.slice(start, start + pageSize).map(r => this.formatPublishResult(r));
        return { list, total, page, pageSize };
    }
    async getPublishById(id) {
        const record = this.publishRecords.get(id);
        return record ? this.formatPublishResult(record) : null;
    }
    async cancelPublish(id) {
        const record = this.publishRecords.get(id);
        if (!record) {
            return { success: false, message: '发布记录不存在' };
        }
        if (record.status === publish_dto_1.PublishStatus.PUBLISHED) {
            return { success: false, message: '已发布的内容无法取消' };
        }
        record.status = publish_dto_1.PublishStatus.FAILED;
        record.platformResults = record.platformResults.map(r => ({
            ...r,
            status: publish_dto_1.PublishStatus.FAILED,
            message: '已取消发布',
        }));
        this.publishRecords.set(id, record);
        return { success: true, message: '发布已取消' };
    }
    async retryPublish(id) {
        const record = this.publishRecords.get(id);
        if (!record) {
            throw new common_1.BadRequestException('发布记录不存在');
        }
        const failedPlatforms = record.platformResults
            .filter(r => r.status === publish_dto_1.PublishStatus.FAILED)
            .map(r => r.platform);
        if (failedPlatforms.length === 0) {
            throw new common_1.BadRequestException('没有失败的发布任务');
        }
        for (const platform of failedPlatforms) {
            const platformConfig = record.targetPlatforms.find(p => p.platform === platform);
            if (platformConfig) {
                const result = await this.publishToPlatform(id, {
                    title: record.title,
                    body: record.body,
                    excerpt: record.excerpt,
                    keywords: record.keywords,
                }, platformConfig);
                const index = record.platformResults.findIndex(r => r.platform === platform);
                if (index !== -1) {
                    record.platformResults[index] = result;
                }
            }
        }
        const hasFailure = record.platformResults.some(r => r.status === publish_dto_1.PublishStatus.FAILED);
        if (!hasFailure) {
            record.status = publish_dto_1.PublishStatus.PUBLISHED;
            record.publishedAt = new Date();
        }
        this.publishRecords.set(id, record);
        return this.formatPublishResult(record);
    }
    async copyContent(contentId) {
        const record = this.publishRecords.get(contentId);
        if (!record) {
            throw new common_1.BadRequestException('内容不存在');
        }
        return {
            success: true,
            content: this.formatForCopy(record),
            format: 'plain_text',
        };
    }
    async exportContent(dto) {
        const records = [];
        for (const contentId of dto.contentIds) {
            const record = this.publishRecords.get(contentId);
            if (record) {
                records.push(record);
            }
        }
        if (records.length === 0) {
            throw new common_1.BadRequestException('没有找到可导出的内容');
        }
        const format = dto.format || publish_dto_1.ExportFormat.TXT;
        const fileName = dto.fileName || `export_${Date.now()}`;
        return {
            success: true,
            fileName: `${fileName}.${format}`,
            content: this.formatForExport(records, format, dto.includeMetadata),
            mimeType: this.getMimeType(format),
        };
    }
    async getPlatformStatus() {
        const platforms = Object.values(publish_dto_1.PublishPlatform);
        return platforms.map(platform => ({
            platform,
            name: this.getPlatformName(platform),
            status: 'active',
            isConnected: true,
        }));
    }
    async publishToPlatform(publishId, content, platformConfig) {
        const platform = platformConfig.platform;
        if (platformConfig.scheduledTime) {
            const scheduledDate = new Date(platformConfig.scheduledTime);
            if (scheduledDate > new Date()) {
                return {
                    platform,
                    platformName: this.getPlatformName(platform),
                    status: publish_dto_1.PublishStatus.SCHEDULED,
                    message: `已安排在 ${scheduledDate.toLocaleString()} 发布`,
                    publishedAt: scheduledDate,
                };
            }
        }
        try {
            const result = await this.callPlatformAPI(platform, content, platformConfig);
            return {
                platform,
                platformName: this.getPlatformName(platform),
                status: publish_dto_1.PublishStatus.PUBLISHED,
                message: '发布成功',
                platformContentId: result.contentId,
                platformUrl: result.url,
                publishedAt: new Date(),
            };
        }
        catch (error) {
            return {
                platform,
                platformName: this.getPlatformName(platform),
                status: publish_dto_1.PublishStatus.FAILED,
                message: '发布失败',
                error: error.message || '未知错误',
            };
        }
    }
    async callPlatformAPI(platform, content, config) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockResponses = {
            [publish_dto_1.PublishPlatform.WEBSITE]: {
                contentId: `web_${Date.now()}`,
                url: `https://example.com/article/${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.WECHAT]: {
                contentId: `wx_${Date.now()}`,
                url: `https://mp.weixin.qq.com/s/${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.WECHAT_MOMENTS]: {
                contentId: `wxpyq_${Date.now()}`,
                url: '',
            },
            [publish_dto_1.PublishPlatform.WEIBO]: {
                contentId: `wb_${Date.now()}`,
                url: `https://weibo.com/u/${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.DOUYIN]: {
                contentId: `dy_${Date.now()}`,
                url: `https://www.douyin.com/video/${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.XIAOHONGSHU]: {
                contentId: `xhs_${Date.now()}`,
                url: `https://www.xiaohongshu.com/discovery/item/${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.BILIBILI]: {
                contentId: `bili_${Date.now()}`,
                url: `https://www.bilibili.com/video/${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.BAIDU]: {
                contentId: `bd_${Date.now()}`,
                url: `https://tieba.baidu.com/p/${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.TAOBAO]: {
                contentId: `tb_${Date.now()}`,
                url: `https://item.taobao.com/item.htm?id=${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.TMALL]: {
                contentId: `tmall_${Date.now()}`,
                url: `https://detail.tmall.com/item.htm?id=${Date.now()}`,
            },
            [publish_dto_1.PublishPlatform.JD]: {
                contentId: `jd_${Date.now()}`,
                url: `https://item.jd.com/${Date.now()}.html`,
            },
            [publish_dto_1.PublishPlatform.CUSTOM]: {
                contentId: `custom_${Date.now()}`,
                url: '',
            },
        };
        return mockResponses[platform] || mockResponses[publish_dto_1.PublishPlatform.CUSTOM];
    }
    async getMockContent(contentId) {
        const record = this.publishRecords.get(contentId);
        if (record) {
            return {
                title: record.title,
                body: record.body,
                contentType: record.contentType,
                keywords: record.keywords,
            };
        }
        return null;
    }
    formatPublishResult(record) {
        return {
            id: record.id,
            title: record.title,
            status: record.status,
            platformResults: record.platformResults,
            createdAt: record.createdAt,
            publishedAt: record.publishedAt,
        };
    }
    formatForCopy(record) {
        let content = `# ${record.title}\n\n`;
        if (record.excerpt) {
            content += `## 摘要\n${record.excerpt}\n\n`;
        }
        content += `## 正文\n${record.body}\n\n`;
        if (record.keywords?.length) {
            content += `## 关键词\n${record.keywords.join(', ')}\n`;
        }
        return content;
    }
    formatForExport(records, format, includeMetadata) {
        switch (format) {
            case publish_dto_1.ExportFormat.JSON:
                return JSON.stringify(records.map(r => ({
                    ...r,
                    platformResults: r.platformResults,
                })), null, 2);
            case publish_dto_1.ExportFormat.HTML:
                return this.generateHtml(records, includeMetadata);
            case publish_dto_1.ExportFormat.MD:
                return this.generateMarkdown(records, includeMetadata);
            case publish_dto_1.ExportFormat.TXT:
            default:
                return records.map(r => this.formatForCopy(r)).join('\n\n' + '='.repeat(50) + '\n\n');
            case publish_dto_1.ExportFormat.DOCX:
                return records.map(r => this.formatForCopy(r)).join('\n\n');
            case publish_dto_1.ExportFormat.PDF:
                return this.generateHtml(records, includeMetadata);
        }
    }
    generateHtml(records, includeMetadata) {
        let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>内容导出 - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .content { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    h1 { color: #333; }
    h2 { color: #666; }
    .meta { color: #999; font-size: 14px; }
    .keywords { color: #0066cc; }
  </style>
</head>
<body>
  <h1>内容导出报告</h1>
  <p class="meta">导出时间: ${new Date().toLocaleString()}</p>`;
        for (const record of records) {
            html += `
  <div class="content">
    <h2>${record.title}</h2>
    ${includeMetadata ? `<p class="meta">类型: ${record.contentType} | 状态: ${record.status} | 创建: ${record.createdAt.toLocaleString()}</p>` : ''}
    ${record.excerpt ? `<p><strong>摘要:</strong> ${record.excerpt}</p>` : ''}
    <div>${record.body.replace(/\n/g, '<br>')}</div>
    ${record.keywords?.length ? `<p class="keywords">关键词: ${record.keywords.join(', ')}</p>` : ''}
    ${includeMetadata ? `<p class="meta">平台: ${record.platformResults.map(r => r.platformName).join(', ')}</p>` : ''}
  </div>`;
        }
        html += `
</body>
</html>`;
        return html;
    }
    generateMarkdown(records, includeMetadata) {
        let md = `# 内容导出报告\n\n`;
        md += `> 导出时间: ${new Date().toLocaleString()}\n\n---\n\n`;
        for (const record of records) {
            md += `## ${record.title}\n\n`;
            if (includeMetadata) {
                md += `**类型:** ${record.contentType} | **状态:** ${record.status} | **创建:** ${record.createdAt.toLocaleString()}\n\n`;
            }
            if (record.excerpt) {
                md += `**摘要:** ${record.excerpt}\n\n`;
            }
            md += `${record.body}\n\n`;
            if (record.keywords?.length) {
                md += `**关键词:** ${record.keywords.join(', ')}\n\n`;
            }
            if (includeMetadata) {
                md += `**发布平台:** ${record.platformResults.map(r => r.platformName).join(', ')}\n\n`;
            }
            md += `---\n\n`;
        }
        return md;
    }
    getMimeType(format) {
        const mimeTypes = {
            [publish_dto_1.ExportFormat.TXT]: 'text/plain',
            [publish_dto_1.ExportFormat.HTML]: 'text/html',
            [publish_dto_1.ExportFormat.MD]: 'text/markdown',
            [publish_dto_1.ExportFormat.JSON]: 'application/json',
            [publish_dto_1.ExportFormat.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            [publish_dto_1.ExportFormat.PDF]: 'application/pdf',
        };
        return mimeTypes[format] || 'text/plain';
    }
    getPlatformName(platform) {
        const names = {
            [publish_dto_1.PublishPlatform.WEBSITE]: '官网',
            [publish_dto_1.PublishPlatform.WECHAT]: '微信公众号',
            [publish_dto_1.PublishPlatform.WECHAT_MOMENTS]: '微信朋友圈',
            [publish_dto_1.PublishPlatform.WEIBO]: '微博',
            [publish_dto_1.PublishPlatform.DOUYIN]: '抖音',
            [publish_dto_1.PublishPlatform.XIAOHONGSHU]: '小红书',
            [publish_dto_1.PublishPlatform.BILIBILI]: 'B站',
            [publish_dto_1.PublishPlatform.BAIDU]: '百度',
            [publish_dto_1.PublishPlatform.TAOBAO]: '淘宝',
            [publish_dto_1.PublishPlatform.TMALL]: '天猫',
            [publish_dto_1.PublishPlatform.JD]: '京东',
            [publish_dto_1.PublishPlatform.CUSTOM]: '自定义',
        };
        return names[platform] || platform;
    }
};
exports.PublishService = PublishService;
exports.PublishService = PublishService = __decorate([
    (0, common_1.Injectable)()
], PublishService);
//# sourceMappingURL=publish.service.js.map