import { Injectable } from '@nestjs/common';
import { DataSourceService } from './data-source.service';

@Injectable()
export class HubService {
  constructor(private dataSource: DataSourceService) {}

  /**
   * 获取全局统计数据
   */
  async getStats(brandId?: string) {
    const stats = await this.dataSource.getDashboardStats();
    return {
      success: true,
      data: {
        ...stats,
        brandId,
      },
    };
  }

  /**
   * 获取老板视图数据
   */
  async getBossView(brandId?: string) {
    const brandStats = brandId
      ? await this.dataSource.getBrandStats(brandId)
      : this.dataSource.getDefaultBrandStats();
    
    return {
      success: true,
      data: {
        stats: brandStats,
        brandId,
      },
    };
  }

  /**
   * 获取运营视图数据
   */
  async getOpsView(brandId?: string, organizationId?: string) {
    const opsStats = organizationId
      ? await this.dataSource.getOpsStats(organizationId)
      : this.dataSource.getDefaultOpsStats();
    
    const pendingTasks = organizationId
      ? await this.dataSource.getPendingTasks(organizationId)
      : [];
    
    const suggestions = organizationId
      ? await this.dataSource.getSuggestions(organizationId)
      : [];
    
    return {
      success: true,
      data: {
        stats: opsStats,
        pendingTasks,
        suggestions,
        brandId,
      },
    };
  }

  /**
   * 获取技术视图数据
   */
  async getTechView(brandId?: string, organizationId?: string) {
    const techStats = organizationId
      ? await this.dataSource.getTechStats(organizationId)
      : this.dataSource.getDefaultTechStats();
    
    return {
      success: true,
      data: {
        stats: techStats,
        tasks: this.getTechTasks(),
        references: this.getTechReferences(),
        brandId,
      },
    };
  }

  /**
   * 获取品牌排名
   */
  async getBrandRanking(organizationId?: string) {
    const rankings = organizationId
      ? await this.dataSource.getBrandRanking(organizationId)
      : this.dataSource.getDefaultBrandRanking();
    
    return {
      success: true,
      data: rankings,
    };
  }

  /**
   * 获取可见度趋势
   */
  async getVisibilityTrend(period: string = '30d', organizationId?: string) {
    const data = organizationId
      ? await this.dataSource.getVisibilityTrend(organizationId, period)
      : this.dataSource.getDefaultVisibilityTrend(period === '7d' ? 7 : period === '90d' ? 90 : 30);
    
    return {
      success: true,
      data,
      period,
    };
  }

  /**
   * 获取待办任务
   */
  async getPendingTasks(brandId?: string, organizationId?: string) {
    const tasks = organizationId
      ? await this.dataSource.getPendingTasks(organizationId)
      : [];
    
    return {
      success: true,
      data: tasks,
      brandId,
    };
  }

  /**
   * 获取运营建议
   */
  async getSuggestions(brandId?: string, organizationId?: string) {
    const suggestions = organizationId
      ? await this.dataSource.getSuggestions(organizationId)
      : [];
    
    return {
      success: true,
      data: suggestions,
      brandId,
    };
  }

  private getTechTasks() {
    return [
      { id: 1, title: '部署JSON-LD结构化数据', description: '参考模法生成代码片段，部署至官网<head>标签内', status: 'pending' },
      { id: 2, title: '完善sitemap.xml', description: '建议新增「解决方案」「行业案例」等栏目 sitemap', status: 'pending' },
      { id: 3, title: '添加客服核心页面Meta标签', description: 'title/description 需包含品牌核心关键词', status: 'pending' },
      { id: 4, title: '提交Bing Webmaster Tools', description: '全站提交索引，提升 Bing/ChatGPT 爬虫友好度', status: 'pending' },
    ];
  }

  private getTechReferences() {
    return [
      { type: 'jsonld', icon: '📋', title: 'JSON-LD代码', description: '复制结构化数据代码', code: this.getJsonLdTemplate() },
      { type: 'meta', icon: '🏷️', title: 'Meta标签', description: '复制SEO优化标签', code: this.getMetaTemplate() },
      { type: 'sitemap', icon: '🗺️', title: 'Sitemap', description: '生成站点地图', code: this.getSitemapTemplate() },
    ];
  }

  private getJsonLdTemplate() {
    return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "您的品牌名",
  "url": "https://yourdomain.com",
  "description": "品牌描述"
}
</script>`;
  }

  private getMetaTemplate() {
    return `<title>品牌名 - 核心关键词</title>
<meta name="description" content="描述内容，包含核心关键词">
<meta name="keywords" content="关键词1, 关键词2, 关键词3">`;
  }

  private getSitemapTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
}
