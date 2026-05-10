import { Injectable, BadRequestException } from '@nestjs/common';
import {
  PublishContentDto,
  BatchPublishDto,
  PublishPlatform,
  PublishStatus,
  PublishContentType,
  PublishResultDto,
  PlatformPublishResult,
  QueryPublishDto,
  ExportContentDto,
  ExportFormat,
  PlatformConfig,
} from '../dto/publish.dto';

/**
 * 发布记录接口
 */
interface PublishRecord {
  id: string;
  title: string;
  body: string;
  excerpt?: string;
  contentType: PublishContentType;
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  targetPlatforms: PlatformConfig[];
  brandId?: string;
  sourceContentId?: string;
  status: PublishStatus;
  platformResults: PlatformPublishResult[];
  createdAt: Date;
  publishedAt?: Date;
  scheduledTime?: Date;
}

@Injectable()
export class PublishService {
  private publishRecords: Map<string, PublishRecord> = new Map();

  /**
   * 发布内容到多平台
   */
  async publishContent(dto: PublishContentDto): Promise<PublishResultDto> {
    const id = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 初始化发布记录
    const record: PublishRecord = {
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
      status: PublishStatus.PENDING,
      platformResults: [],
      createdAt: new Date(),
    };

    // 处理每个目标平台
    const publishPromises = dto.targetPlatforms.map(platform => 
      this.publishToPlatform(id, dto, platform)
    );

    // 等待所有平台发布完成
    record.platformResults = await Promise.all(publishPromises);
    
    // 更新整体状态
    const hasFailure = record.platformResults.some(r => r.status === PublishStatus.FAILED);
    const allSuccess = record.platformResults.every(r => r.status === PublishStatus.PUBLISHED);
    
    if (hasFailure) {
      record.status = PublishStatus.FAILED;
    } else if (allSuccess) {
      record.status = PublishStatus.PUBLISHED;
      record.publishedAt = new Date();
    } else {
      record.status = PublishStatus.PUBLISHING;
    }

    this.publishRecords.set(id, record);

    return this.formatPublishResult(record);
  }

  /**
   * 批量发布
   */
  async batchPublish(dto: BatchPublishDto): Promise<{ results: PublishResultDto[]; summary: { total: number; success: number; failed: number } }> {
    const results: PublishResultDto[] = [];
    let success = 0;
    let failed = 0;

    for (const contentId of dto.contentIds) {
      // 模拟从内容服务获取内容
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
      } catch (e) {
        failed++;
      }
    }

    return {
      results,
      summary: { total: dto.contentIds.length, success, failed },
    };
  }

  /**
   * 获取发布记录列表
   */
  async getPublishList(query: QueryPublishDto): Promise<{ list: PublishResultDto[]; total: number; page: number; pageSize: number }> {
    let records = Array.from(this.publishRecords.values());

    // 过滤
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
      records = records.filter(r => 
        r.platformResults.some(pr => pr.platform === query.platform)
      );
    }

    // 分页
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const total = records.length;
    const start = (page - 1) * pageSize;
    const list = records.slice(start, start + pageSize).map(r => this.formatPublishResult(r));

    return { list, total, page, pageSize };
  }

  /**
   * 获取发布记录详情
   */
  async getPublishById(id: string): Promise<PublishResultDto | null> {
    const record = this.publishRecords.get(id);
    return record ? this.formatPublishResult(record) : null;
  }

  /**
   * 取消发布
   */
  async cancelPublish(id: string): Promise<{ success: boolean; message: string }> {
    const record = this.publishRecords.get(id);
    if (!record) {
      return { success: false, message: '发布记录不存在' };
    }

    if (record.status === PublishStatus.PUBLISHED) {
      return { success: false, message: '已发布的内容无法取消' };
    }

    record.status = PublishStatus.FAILED;
    record.platformResults = record.platformResults.map(r => ({
      ...r,
      status: PublishStatus.FAILED,
      message: '已取消发布',
    }));

    this.publishRecords.set(id, record);
    return { success: true, message: '发布已取消' };
  }

  /**
   * 重新发布失败的平台
   */
  async retryPublish(id: string): Promise<PublishResultDto> {
    const record = this.publishRecords.get(id);
    if (!record) {
      throw new BadRequestException('发布记录不存在');
    }

    // 找出失败的平台
    const failedPlatforms = record.platformResults
      .filter(r => r.status === PublishStatus.FAILED)
      .map(r => r.platform);

    if (failedPlatforms.length === 0) {
      throw new BadRequestException('没有失败的发布任务');
    }

    // 重新发布失败的平台
    for (const platform of failedPlatforms) {
      const platformConfig = record.targetPlatforms.find(p => p.platform === platform);
      if (platformConfig) {
        const result = await this.publishToPlatform(id, {
          title: record.title,
          body: record.body,
          excerpt: record.excerpt,
          keywords: record.keywords,
        }, platformConfig);
        
        // 更新结果
        const index = record.platformResults.findIndex(r => r.platform === platform);
        if (index !== -1) {
          record.platformResults[index] = result;
        }
      }
    }

    // 更新状态
    const hasFailure = record.platformResults.some(r => r.status === PublishStatus.FAILED);
    if (!hasFailure) {
      record.status = PublishStatus.PUBLISHED;
      record.publishedAt = new Date();
    }

    this.publishRecords.set(id, record);
    return this.formatPublishResult(record);
  }

  /**
   * 复制内容（到剪贴板）
   */
  async copyContent(contentId: string): Promise<{ success: boolean; content: string; format: string }> {
    const record = this.publishRecords.get(contentId);
    if (!record) {
      throw new BadRequestException('内容不存在');
    }

    return {
      success: true,
      content: this.formatForCopy(record),
      format: 'plain_text',
    };
  }

  /**
   * 导出内容
   */
  async exportContent(dto: ExportContentDto): Promise<{ success: boolean; fileName: string; content: string; mimeType: string }> {
    const records: PublishRecord[] = [];
    
    for (const contentId of dto.contentIds) {
      const record = this.publishRecords.get(contentId);
      if (record) {
        records.push(record);
      }
    }

    if (records.length === 0) {
      throw new BadRequestException('没有找到可导出的内容');
    }

    const format = dto.format || ExportFormat.TXT;
    const fileName = dto.fileName || `export_${Date.now()}`;

    return {
      success: true,
      fileName: `${fileName}.${format}`,
      content: this.formatForExport(records, format, dto.includeMetadata),
      mimeType: this.getMimeType(format),
    };
  }

  /**
   * 获取平台状态
   */
  async getPlatformStatus(): Promise<{ platform: PublishPlatform; name: string; status: string; isConnected: boolean }[]> {
    const platforms = Object.values(PublishPlatform);
    return platforms.map(platform => ({
      platform,
      name: this.getPlatformName(platform),
      status: 'active',
      isConnected: true, // 实际应该检查连接状态
    }));
  }

  // ==================== 私有方法 ====================

  /**
   * 发布到指定平台
   */
  private async publishToPlatform(
    publishId: string,
    content: { title: string; body: string; excerpt?: string; keywords?: string[] },
    platformConfig: PlatformConfig
  ): Promise<PlatformPublishResult> {
    const platform = platformConfig.platform;
    
    // 检查是否排期
    if (platformConfig.scheduledTime) {
      const scheduledDate = new Date(platformConfig.scheduledTime);
      if (scheduledDate > new Date()) {
        return {
          platform,
          platformName: this.getPlatformName(platform),
          status: PublishStatus.SCHEDULED,
          message: `已安排在 ${scheduledDate.toLocaleString()} 发布`,
          publishedAt: scheduledDate,
        };
      }
    }

    try {
      // 根据平台调用不同的发布方法
      const result = await this.callPlatformAPI(platform, content, platformConfig);
      
      return {
        platform,
        platformName: this.getPlatformName(platform),
        status: PublishStatus.PUBLISHED,
        message: '发布成功',
        platformContentId: result.contentId,
        platformUrl: result.url,
        publishedAt: new Date(),
      };
    } catch (error) {
      return {
        platform,
        platformName: this.getPlatformName(platform),
        status: PublishStatus.FAILED,
        message: '发布失败',
        error: error.message || '未知错误',
      };
    }
  }

  /**
   * 调用平台API（模拟）
   */
  private async callPlatformAPI(
    platform: PublishPlatform,
    content: { title: string; body: string; excerpt?: string },
    config: PlatformConfig
  ): Promise<{ contentId: string; url: string }> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟各平台的响应
    const mockResponses: Record<PublishPlatform, { contentId: string; url: string }> = {
      [PublishPlatform.WEBSITE]: {
        contentId: `web_${Date.now()}`,
        url: `https://example.com/article/${Date.now()}`,
      },
      [PublishPlatform.WECHAT]: {
        contentId: `wx_${Date.now()}`,
        url: `https://mp.weixin.qq.com/s/${Date.now()}`,
      },
      [PublishPlatform.WECHAT_MOMENTS]: {
        contentId: `wxpyq_${Date.now()}`,
        url: '',
      },
      [PublishPlatform.WEIBO]: {
        contentId: `wb_${Date.now()}`,
        url: `https://weibo.com/u/${Date.now()}`,
      },
      [PublishPlatform.DOUYIN]: {
        contentId: `dy_${Date.now()}`,
        url: `https://www.douyin.com/video/${Date.now()}`,
      },
      [PublishPlatform.XIAOHONGSHU]: {
        contentId: `xhs_${Date.now()}`,
        url: `https://www.xiaohongshu.com/discovery/item/${Date.now()}`,
      },
      [PublishPlatform.BILIBILI]: {
        contentId: `bili_${Date.now()}`,
        url: `https://www.bilibili.com/video/${Date.now()}`,
      },
      [PublishPlatform.BAIDU]: {
        contentId: `bd_${Date.now()}`,
        url: `https://tieba.baidu.com/p/${Date.now()}`,
      },
      [PublishPlatform.TAOBAO]: {
        contentId: `tb_${Date.now()}`,
        url: `https://item.taobao.com/item.htm?id=${Date.now()}`,
      },
      [PublishPlatform.TMALL]: {
        contentId: `tmall_${Date.now()}`,
        url: `https://detail.tmall.com/item.htm?id=${Date.now()}`,
      },
      [PublishPlatform.JD]: {
        contentId: `jd_${Date.now()}`,
        url: `https://item.jd.com/${Date.now()}.html`,
      },
      [PublishPlatform.CUSTOM]: {
        contentId: `custom_${Date.now()}`,
        url: '',
      },
    };

    return mockResponses[platform] || mockResponses[PublishPlatform.CUSTOM];
  }

  /**
   * 模拟获取内容（实际应该从内容服务获取）
   */
  private async getMockContent(contentId: string): Promise<any | null> {
    // 实际应该调用内容服务
    // 这里返回模拟数据
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

  /**
   * 格式化发布结果
   */
  private formatPublishResult(record: PublishRecord): PublishResultDto {
    return {
      id: record.id,
      title: record.title,
      status: record.status,
      platformResults: record.platformResults,
      createdAt: record.createdAt,
      publishedAt: record.publishedAt,
    };
  }

  /**
   * 格式化复制内容
   */
  private formatForCopy(record: PublishRecord): string {
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

  /**
   * 格式化导出内容
   */
  private formatForExport(records: PublishRecord[], format: ExportFormat, includeMetadata?: boolean): string {
    switch (format) {
      case ExportFormat.JSON:
        return JSON.stringify(records.map(r => ({
          ...r,
          platformResults: r.platformResults,
        })), null, 2);

      case ExportFormat.HTML:
        return this.generateHtml(records, includeMetadata);

      case ExportFormat.MD:
        return this.generateMarkdown(records, includeMetadata);

      case ExportFormat.TXT:
      default:
        return records.map(r => this.formatForCopy(r)).join('\n\n' + '='.repeat(50) + '\n\n');

      case ExportFormat.DOCX:
        // DOCX需要特殊处理，这里返回简化版本
        return records.map(r => this.formatForCopy(r)).join('\n\n');

      case ExportFormat.PDF:
        // PDF需要特殊处理，这里返回HTML供转换
        return this.generateHtml(records, includeMetadata);
    }
  }

  /**
   * 生成HTML
   */
  private generateHtml(records: PublishRecord[], includeMetadata?: boolean): string {
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

  /**
   * 生成Markdown
   */
  private generateMarkdown(records: PublishRecord[], includeMetadata?: boolean): string {
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

  /**
   * 获取MIME类型
   */
  private getMimeType(format: ExportFormat): string {
    const mimeTypes: Record<ExportFormat, string> = {
      [ExportFormat.TXT]: 'text/plain',
      [ExportFormat.HTML]: 'text/html',
      [ExportFormat.MD]: 'text/markdown',
      [ExportFormat.JSON]: 'application/json',
      [ExportFormat.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      [ExportFormat.PDF]: 'application/pdf',
    };
    return mimeTypes[format] || 'text/plain';
  }

  /**
   * 获取平台名称
   */
  private getPlatformName(platform: PublishPlatform): string {
    const names: Record<PublishPlatform, string> = {
      [PublishPlatform.WEBSITE]: '官网',
      [PublishPlatform.WECHAT]: '微信公众号',
      [PublishPlatform.WECHAT_MOMENTS]: '微信朋友圈',
      [PublishPlatform.WEIBO]: '微博',
      [PublishPlatform.DOUYIN]: '抖音',
      [PublishPlatform.XIAOHONGSHU]: '小红书',
      [PublishPlatform.BILIBILI]: 'B站',
      [PublishPlatform.BAIDU]: '百度',
      [PublishPlatform.TAOBAO]: '淘宝',
      [PublishPlatform.TMALL]: '天猫',
      [PublishPlatform.JD]: '京东',
      [PublishPlatform.CUSTOM]: '自定义',
    };
    return names[platform] || platform;
  }
}

