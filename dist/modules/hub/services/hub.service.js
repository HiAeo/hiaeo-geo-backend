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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubService = void 0;
const common_1 = require("@nestjs/common");
const data_source_service_1 = require("./data-source.service");
let HubService = class HubService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getStats(brandId) {
        const stats = await this.dataSource.getDashboardStats();
        return {
            success: true,
            data: {
                ...stats,
                brandId,
            },
        };
    }
    async getBossView(brandId) {
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
    async getOpsView(brandId, organizationId) {
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
    async getTechView(brandId, organizationId) {
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
    async getBrandRanking(organizationId) {
        const rankings = organizationId
            ? await this.dataSource.getBrandRanking(organizationId)
            : this.dataSource.getDefaultBrandRanking();
        return {
            success: true,
            data: rankings,
        };
    }
    async getVisibilityTrend(period = '30d', organizationId) {
        const data = organizationId
            ? await this.dataSource.getVisibilityTrend(organizationId, period)
            : this.dataSource.getDefaultVisibilityTrend(period === '7d' ? 7 : period === '90d' ? 90 : 30);
        return {
            success: true,
            data,
            period,
        };
    }
    async getPendingTasks(brandId, organizationId) {
        const tasks = organizationId
            ? await this.dataSource.getPendingTasks(organizationId)
            : [];
        return {
            success: true,
            data: tasks,
            brandId,
        };
    }
    async getSuggestions(brandId, organizationId) {
        const suggestions = organizationId
            ? await this.dataSource.getSuggestions(organizationId)
            : [];
        return {
            success: true,
            data: suggestions,
            brandId,
        };
    }
    getTechTasks() {
        return [
            { id: 1, title: '部署JSON-LD结构化数据', description: '参考模法生成代码片段，部署至官网<head>标签内', status: 'pending' },
            { id: 2, title: '完善sitemap.xml', description: '建议新增「解决方案」「行业案例」等栏目 sitemap', status: 'pending' },
            { id: 3, title: '添加客服核心页面Meta标签', description: 'title/description 需包含品牌核心关键词', status: 'pending' },
            { id: 4, title: '提交Bing Webmaster Tools', description: '全站提交索引，提升 Bing/ChatGPT 爬虫友好度', status: 'pending' },
        ];
    }
    getTechReferences() {
        return [
            { type: 'jsonld', icon: '📋', title: 'JSON-LD代码', description: '复制结构化数据代码', code: this.getJsonLdTemplate() },
            { type: 'meta', icon: '🏷️', title: 'Meta标签', description: '复制SEO优化标签', code: this.getMetaTemplate() },
            { type: 'sitemap', icon: '🗺️', title: 'Sitemap', description: '生成站点地图', code: this.getSitemapTemplate() },
        ];
    }
    getJsonLdTemplate() {
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
    getMetaTemplate() {
        return `<title>品牌名 - 核心关键词</title>
<meta name="description" content="描述内容，包含核心关键词">
<meta name="keywords" content="关键词1, 关键词2, 关键词3">`;
    }
    getSitemapTemplate() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    }
};
exports.HubService = HubService;
exports.HubService = HubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_source_service_1.DataSourceService])
], HubService);
//# sourceMappingURL=hub.service.js.map