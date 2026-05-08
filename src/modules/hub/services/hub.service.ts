import { Injectable } from '@nestjs/common'

@Injectable()
export class HubService {
  // 内存存储 - 后续可接入数据库
  private stats = {
    totalUsers: 10,
    activeUsers: 9,
    totalCredits: 77850,
    monthlyRevenue: 28500,
    freeUsers: 3,
    proUsers: 4,
    enterpriseUsers: 3
  }

  private bossStats = {
    geoScore: 72,
    industryAvg: 65,
    mentionRate: 34,
    mentionTarget: 50,
    competitorSuppression: 12,
    competitorCount: 3,
    roi: 23
  }

  private techStats = {
    apiHealth: 95,
    crawlerScore: 88,
    schemaScore: 75,
    performance: 92,
    pendingTasks: 2
  }

  private opsStats = {
    pendingCount: 3,
    totalContent: 24,
    publishedContent: 18,
    pendingContent: 6,
    avgEngagement: 12.5
  }

  async getStats(brandId?: string) {
    return {
      success: true,
      data: {
        ...this.stats,
        brandId
      }
    }
  }

  async getBossView(brandId?: string) {
    return {
      success: true,
      data: {
        stats: this.bossStats,
        brandId
      }
    }
  }

  async getOpsView(brandId?: string) {
    return {
      success: true,
      data: {
        stats: this.opsStats,
        pendingTasks: await this.getPendingTasks(brandId),
        suggestions: await this.getSuggestions(brandId),
        brandId
      }
    }
  }

  async getTechView(brandId?: string) {
    return {
      success: true,
      data: {
        stats: this.techStats,
        tasks: this.getTechTasks(),
        references: this.getTechReferences(),
        brandId
      }
    }
  }

  async getBrandRanking() {
    return {
      success: true,
      data: [
        { id: 1, name: '示例品牌', score: 72, mentionRate: 34, trend: 8, isCurrentBrand: true },
        { id: 2, name: '竞品A', score: 68, mentionRate: 28, trend: 3, isCurrentBrand: false },
        { id: 3, name: '竞品B', score: 65, mentionRate: 22, trend: -2, isCurrentBrand: false },
        { id: 4, name: '竞品C', score: 58, mentionRate: 18, trend: 5, isCurrentBrand: false }
      ]
    }
  }

  async getVisibilityTrend(period: string = '30d') {
    // 根据周期生成不同长度的数据
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    const data = []
    let baseValue = 50

    for (let i = 0; i < days; i += Math.ceil(days / 7)) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      data.push({
        date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        value: Math.min(100, baseValue + Math.floor(Math.random() * 10))
      })
      baseValue = Math.min(100, baseValue + Math.floor(Math.random() * 5))
    }

    return {
      success: true,
      data,
      period
    }
  }

  async getPendingTasks(brandId?: string) {
    return {
      success: true,
      data: [
        { id: 1, title: '《中小企业如何选客服系统》', style: 'DeepSeek风格', platform: '小红书', impact: 12, status: 'pending' },
        { id: 2, title: 'JSON-LD结构化数据配置', style: '官网部署', platform: '官网', impact: 8, status: 'pending' },
        { id: 3, title: '竞品对比页FAQ扩展', style: 'Kimi风格', platform: '官网', impact: 6, status: 'pending' }
      ],
      brandId
    }
  }

  async getSuggestions(brandId?: string) {
    return {
      success: true,
      data: [
        { text: '豆包提及率仍低于行业平均，建议补充2篇豆包风格的短视频脚本，适配生活化种草场景', tag: '高优先级', priority: 'high' },
        { text: '本周已发布3篇DeepSeek风格内容，建议下周切换豆包/Kimi风格内容进行A/B测试', tag: '建议', priority: 'medium' },
        { text: '官网「关于我们」页缺少核心优势关键词，建议更新为AI人设定位版本', tag: '优化', priority: 'low' }
      ],
      brandId
    }
  }

  private getTechTasks() {
    return [
      { id: 1, title: '部署JSON-LD结构化数据', description: '参考模法生成代码片段，部署至官网<head>标签内', status: 'completed' },
      { id: 2, title: '完善sitemap.xml', description: '建议新增「解决方案」「行业案例」等栏目 sitemap', status: 'completed' },
      { id: 3, title: '添加客服核心页面Meta标签', description: 'title/description 需包含品牌核心关键词', status: 'pending' },
      { id: 4, title: '提交Bing Webmaster Tools', description: '全站提交索引，提升 Bing/ChatGPT 爬虫友好度', status: 'pending' }
    ]
  }

  private getTechReferences() {
    return [
      { type: 'jsonld', icon: '📋', title: 'JSON-LD代码', description: '复制结构化数据代码', code: this.getJsonLdTemplate() },
      { type: 'meta', icon: '🏷️', title: 'Meta标签', description: '复制SEO优化标签', code: this.getMetaTemplate() },
      { type: 'sitemap', icon: '🗺️', title: 'Sitemap', description: '生成站点地图', code: this.getSitemapTemplate() }
    ]
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
</script>`
  }

  private getMetaTemplate() {
    return `<title>品牌名 - 核心关键词</title>
<meta name="description" content="描述内容，包含核心关键词">
<meta name="keywords" content="关键词1, 关键词2, 关键词3">`
  }

  private getSitemapTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
  }
}
