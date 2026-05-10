"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebScraperService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
let WebScraperService = WebScraperService_1 = class WebScraperService {
    constructor() {
        this.logger = new common_1.Logger(WebScraperService_1.name);
        this.httpClient = axios_1.default.create({
            timeout: 30000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; HiaeoBot/1.0; +https://hiaeo.com/bot)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
            validateStatus: (status) => status < 500,
        });
    }
    async scrapeWebsite(url) {
        try {
            const normalizedUrl = this.normalizeUrl(url);
            if (!normalizedUrl) {
                throw new common_1.BadRequestException('无效的URL格式');
            }
            this.logger.log(`开始爬取网站: ${normalizedUrl}`);
            const response = await this.httpClient.get(normalizedUrl);
            const html = response.data;
            const $ = cheerio.load(html);
            const data = this.extractPageData($, normalizedUrl);
            const score = this.calculateBasicScore(data);
            this.logger.log(`网站爬取成功: ${normalizedUrl}, 技术分: ${score.technical}, 内容分: ${score.content}`);
            return {
                success: true,
                data,
                score,
            };
        }
        catch (error) {
            this.logger.error(`网站爬取失败: ${url}`, error.message);
            return {
                success: false,
                error: error.message,
                score: {
                    technical: 0,
                    content: 0,
                    accessibility: 0,
                    performance: 0,
                },
            };
        }
    }
    async scrapeMultiple(urls) {
        const results = [];
        for (const url of urls) {
            const result = await this.scrapeWebsite(url);
            results.push(result);
            await this.delay(1000);
        }
        return results;
    }
    normalizeUrl(url) {
        try {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            const urlObj = new URL(url);
            return urlObj.href;
        }
        catch {
            return null;
        }
    }
    extractPageData($, baseUrl) {
        const baseUrlObj = new URL(baseUrl);
        const metaTags = {};
        $('meta').each((_, el) => {
            const name = $(el).attr('name') || $(el).attr('property');
            const content = $(el).attr('content');
            if (name && content) {
                metaTags[name] = content;
            }
        });
        const openGraph = {};
        $('meta[property^="og:"]').each((_, el) => {
            const property = $(el).attr('property')?.replace('og:', '');
            const content = $(el).attr('content');
            if (property && content) {
                openGraph[property] = content;
            }
        });
        const twitter = {};
        $('meta[name^="twitter:"]').each((_, el) => {
            const name = $(el).attr('name')?.replace('twitter:', '');
            const content = $(el).attr('content');
            if (name && content) {
                twitter[name] = content;
            }
        });
        const links = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text().trim();
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                try {
                    const linkUrl = new URL(href, baseUrl);
                    links.push({
                        href: linkUrl.href,
                        text: text.substring(0, 100),
                        isExternal: linkUrl.hostname !== baseUrlObj.hostname,
                    });
                }
                catch {
                }
            }
        });
        const images = [];
        $('img').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src') || '';
            const alt = $(el).attr('alt') || '';
            const loading = $(el).attr('loading') || $(el).attr('data-loading');
            if (src) {
                try {
                    const imgUrl = new URL(src, baseUrl);
                    images.push({
                        src: imgUrl.href,
                        alt,
                        isLazy: loading === 'lazy',
                    });
                }
                catch {
                    images.push({ src, alt, isLazy: loading === 'lazy' });
                }
            }
        });
        const scripts = [];
        $('script[src]').each((_, el) => {
            const src = $(el).attr('src') || '';
            const async = $(el).attr('async') !== undefined;
            const defer = $(el).attr('defer') !== undefined;
            if (src) {
                try {
                    const scriptUrl = new URL(src, baseUrl);
                    scripts.push({
                        src: scriptUrl.href,
                        isAsync: async,
                        isDeferred: defer,
                    });
                }
                catch {
                    scripts.push({ src, isAsync: async, isDeferred: defer });
                }
            }
        });
        const styles = [];
        $('link[rel="stylesheet"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const media = $(el).attr('media') || 'all';
            if (href) {
                try {
                    const styleUrl = new URL(href, baseUrl);
                    styles.push({
                        href: styleUrl.href,
                        media,
                    });
                }
                catch {
                    styles.push({ href, media });
                }
            }
        });
        const schemaOrg = [];
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const content = $(el).html();
                if (content) {
                    const data = JSON.parse(content);
                    schemaOrg.push(data);
                }
            }
            catch {
            }
        });
        const internalLinks = links.filter(l => !l.isExternal).length;
        const externalLinks = links.filter(l => l.isExternal).length;
        const imagesWithAlt = images.filter(i => i.alt).length;
        const imagesWithoutAlt = images.length - imagesWithAlt;
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
        return {
            url: baseUrl,
            title: $('title').text().trim(),
            description: metaTags['description'] || '',
            keywords: this.parseKeywords(metaTags['keywords']),
            h1: $('h1').map((_, el) => $(el).text().trim()).get().filter((t) => t),
            h2: $('h2').map((_, el) => $(el).text().trim()).get().filter((t) => t),
            links,
            images,
            scripts,
            styles,
            metaTags,
            openGraph,
            twitter,
            canonical: $('link[rel="canonical"]').attr('href') || '',
            robots: metaTags['robots'] || '',
            schemaOrg,
            viewport: $('meta[name="viewport"]').attr('content') || '',
            charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content')?.split('charset=')[1] || '',
            lang: $('html').attr('lang') || '',
            bodyText,
            wordCount: bodyText.split(/\s+/).filter((w) => w.length > 0).length,
            linksCount: { internal: internalLinks, external: externalLinks },
            imagesWithAlt,
            imagesWithoutAlt,
        };
    }
    parseKeywords(keywords) {
        if (!keywords)
            return [];
        return keywords.split(',').map(k => k.trim()).filter(k => k);
    }
    calculateBasicScore(data) {
        let technical = 0;
        let content = 0;
        let accessibility = 0;
        let performance = 0;
        if (data.title)
            technical += 5;
        if (data.description && data.description.length >= 50)
            technical += 5;
        if (data.canonical)
            technical += 3;
        if (data.viewport)
            technical += 3;
        if (data.charset)
            technical += 3;
        if (data.lang)
            technical += 3;
        if (data.robots !== 'noindex')
            technical += 3;
        if (data.h1.length > 0)
            content += 5;
        if (data.h1.length <= 1)
            content += 5;
        if (data.wordCount >= 300)
            content += 5;
        if (data.keywords.length > 0)
            content += 5;
        if (data.bodyText.length > 0)
            content += 5;
        const altPercentage = data.images.length > 0 ? (data.imagesWithAlt / data.images.length) * 100 : 100;
        accessibility += Math.min(25, (altPercentage / 100) * 25);
        if (data.lang)
            accessibility += 5;
        if (data.openGraph['title'])
            accessibility += 5;
        if (data.twitter['card'])
            accessibility += 5;
        if (data.twitter['image'])
            accessibility += 5;
        const criticalScripts = data.scripts.filter(s => !s.isAsync && !s.isDeferred).length;
        if (criticalScripts === 0)
            performance += 10;
        else if (criticalScripts <= 3)
            performance += 5;
        if (data.styles.length <= 5)
            performance += 5;
        else if (data.styles.length <= 10)
            performance += 3;
        if (data.images.length === 0 || data.images.some(i => i.isLazy))
            performance += 5;
        if (data.bodyText.length > 0)
            performance += 5;
        return {
            technical: Math.round(technical * 4),
            content: Math.round(content * 4),
            accessibility: Math.round(accessibility * 4),
            performance: Math.round(performance * 4),
        };
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.WebScraperService = WebScraperService;
exports.WebScraperService = WebScraperService = WebScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WebScraperService);
//# sourceMappingURL=web-scraper.service.js.map