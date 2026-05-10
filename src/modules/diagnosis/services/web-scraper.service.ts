import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

export interface WebPageData {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string[];
  h2: string[];
  links: { href: string; text: string; isExternal: boolean }[];
  images: { src: string; alt: string; isLazy: boolean }[];
  scripts: { src: string; isAsync: boolean; isDeferred: boolean }[];
  styles: { href: string; media: string }[];
  metaTags: Record<string, string>;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  canonical: string;
  robots: string;
  schemaOrg: Record<string, any>[];
  viewport: string;
  charset: string;
  lang: string;
  bodyText: string;
  wordCount: number;
  linksCount: { internal: number; external: number };
  imagesWithAlt: number;
  imagesWithoutAlt: number;
}

export interface WebScrapeResult {
  success: boolean;
  data?: WebPageData;
  error?: string;
  score: {
    technical: number;
    content: number;
    accessibility: number;
    performance: number;
  };
}

@Injectable()
export class WebScraperService {
  private readonly logger = new Logger(WebScraperService.name);
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
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

  /**
   * 爬取网页并提取SEO数据
   */
  async scrapeWebsite(url: string): Promise<WebScrapeResult> {
    try {
      // 验证URL格式
      const normalizedUrl = this.normalizeUrl(url);
      if (!normalizedUrl) {
        throw new BadRequestException('无效的URL格式');
      }

      this.logger.log(`开始爬取网站: ${normalizedUrl}`);

      const response = await this.httpClient.get(normalizedUrl);
      const html = response.data;

      // 使用cheerio解析HTML
      const $ = cheerio.load(html as string);

      // 提取各种数据
      const data = this.extractPageData($, normalizedUrl);

      // 计算基础分数
      const score = this.calculateBasicScore(data);

      this.logger.log(`网站爬取成功: ${normalizedUrl}, 技术分: ${score.technical}, 内容分: ${score.content}`);

      return {
        success: true,
        data,
        score,
      };
    } catch (error: any) {
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

  /**
   * 批量爬取多个页面
   */
  async scrapeMultiple(urls: string[]): Promise<WebScrapeResult[]> {
    const results: WebScrapeResult[] = [];
    
    for (const url of urls) {
      const result = await this.scrapeWebsite(url);
      results.push(result);
      
      // 添加延迟避免被封
      await this.delay(1000);
    }
    
    return results;
  }

  /**
   * 规范化URL
   */
  private normalizeUrl(url: string): string | null {
    try {
      // 添加协议如果缺失
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      return urlObj.href;
    } catch {
      return null;
    }
  }

  /**
   * 从HTML中提取页面数据
   */
  private extractPageData($: any, baseUrl: string): WebPageData {
    const baseUrlObj = new URL(baseUrl);

    // 提取Meta标签
    const metaTags: Record<string, string> = {};
    $('meta').each((_: number, el: any) => {
      const name = $(el).attr('name') || $(el).attr('property');
      const content = $(el).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    // 提取Open Graph标签
    const openGraph: Record<string, string> = {};
    $('meta[property^="og:"]').each((_: number, el: any) => {
      const property = $(el).attr('property')?.replace('og:', '');
      const content = $(el).attr('content');
      if (property && content) {
        openGraph[property] = content;
      }
    });

    // 提取Twitter标签
    const twitter: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_: number, el: any) => {
      const name = $(el).attr('name')?.replace('twitter:', '');
      const content = $(el).attr('content');
      if (name && content) {
        twitter[name] = content;
      }
    });

    // 提取链接
    const links: { href: string; text: string; isExternal: boolean }[] = [];
    $('a[href]').each((_: number, el: any) => {
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
        } catch {
          // 忽略无效链接
        }
      }
    });

    // 提取图片
    const images: { src: string; alt: string; isLazy: boolean }[] = [];
    $('img').each((_: number, el: any) => {
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
        } catch {
          images.push({ src, alt, isLazy: loading === 'lazy' });
        }
      }
    });

    // 提取脚本
    const scripts: { src: string; isAsync: boolean; isDeferred: boolean }[] = [];
    $('script[src]').each((_: number, el: any) => {
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
        } catch {
          scripts.push({ src, isAsync: async, isDeferred: defer });
        }
      }
    });

    // 提取样式表
    const styles: { href: string; media: string }[] = [];
    $('link[rel="stylesheet"]').each((_: number, el: any) => {
      const href = $(el).attr('href') || '';
      const media = $(el).attr('media') || 'all';
      
      if (href) {
        try {
          const styleUrl = new URL(href, baseUrl);
          styles.push({
            href: styleUrl.href,
            media,
          });
        } catch {
          styles.push({ href, media });
        }
      }
    });

    // 提取Schema.org数据
    const schemaOrg: Record<string, any>[] = [];
    $('script[type="application/ld+json"]').each((_: number, el: any) => {
      try {
        const content = $(el).html();
        if (content) {
          const data = JSON.parse(content);
          schemaOrg.push(data);
        }
      } catch {
        // 忽略无效JSON
      }
    });

    // 统计链接
    const internalLinks = links.filter(l => !l.isExternal).length;
    const externalLinks = links.filter(l => l.isExternal).length;

    // 统计图片
    const imagesWithAlt = images.filter(i => i.alt).length;
    const imagesWithoutAlt = images.length - imagesWithAlt;

    // 获取正文文本
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

    return {
      url: baseUrl,
      title: $('title').text().trim(),
      description: metaTags['description'] || '',
      keywords: this.parseKeywords(metaTags['keywords']),
      h1: $('h1').map((_: number, el: any) => $(el).text().trim()).get().filter((t: string) => t),
      h2: $('h2').map((_: number, el: any) => $(el).text().trim()).get().filter((t: string) => t),
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
      wordCount: bodyText.split(/\s+/).filter((w: string) => w.length > 0).length,
      linksCount: { internal: internalLinks, external: externalLinks },
      imagesWithAlt,
      imagesWithoutAlt,
    };
  }

  /**
   * 解析关键词
   */
  private parseKeywords(keywords: string | undefined): string[] {
    if (!keywords) return [];
    return keywords.split(',').map(k => k.trim()).filter(k => k);
  }

  /**
   * 计算基础SEO分数
   */
  private calculateBasicScore(data: WebPageData): { technical: number; content: number; accessibility: number; performance: number } {
    let technical = 0;
    let content = 0;
    let accessibility = 0;
    let performance = 0;

    // 技术SEO评分 (25分)
    if (data.title) technical += 5;
    if (data.description && data.description.length >= 50) technical += 5;
    if (data.canonical) technical += 3;
    if (data.viewport) technical += 3;
    if (data.charset) technical += 3;
    if (data.lang) technical += 3;
    if (data.robots !== 'noindex') technical += 3;

    // 内容评分 (25分)
    if (data.h1.length > 0) content += 5;
    if (data.h1.length <= 1) content += 5; // 只有一个H1最佳
    if (data.wordCount >= 300) content += 5;
    if (data.keywords.length > 0) content += 5;
    if (data.bodyText.length > 0) content += 5;

    // 可访问性评分 (25分)
    const altPercentage = data.images.length > 0 ? (data.imagesWithAlt / data.images.length) * 100 : 100;
    accessibility += Math.min(25, (altPercentage / 100) * 25);
    
    if (data.lang) accessibility += 5;
    if (data.openGraph['title']) accessibility += 5;
    if (data.twitter['card']) accessibility += 5;
    if (data.twitter['image']) accessibility += 5;

    // 性能评分 (25分)
    const criticalScripts = data.scripts.filter(s => !s.isAsync && !s.isDeferred).length;
    if (criticalScripts === 0) performance += 10;
    else if (criticalScripts <= 3) performance += 5;
    
    if (data.styles.length <= 5) performance += 5;
    else if (data.styles.length <= 10) performance += 3;
    
    if (data.images.length === 0 || data.images.some(i => i.isLazy)) performance += 5;
    if (data.bodyText.length > 0) performance += 5;

    return {
      technical: Math.round(technical * 4), // 转换为100分制
      content: Math.round(content * 4),
      accessibility: Math.round(accessibility * 4),
      performance: Math.round(performance * 4),
    };
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
