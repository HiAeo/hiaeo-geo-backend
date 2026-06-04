import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WebsiteData {
  title: string;
  description: string;
  keywords: string[];
  h1: string[];
  h2: string[];
  h3: string[];
  mainContent: string;
  aboutContent: string;
  footerContent: string;
  contacts: {
    email?: string;
    phone?: string;
    address?: string;
    fax?: string;
  };
  social: {
    weibo?: string;
    wechat?: string;
    zhihu?: string;
    douyin?: string;
    linkedin?: string;
  };
}

export interface AISuggestion {
  basicInfo: {
    companyName?: string;
    industry?: string;
    companyRegion?: string;
    companySize?: string;
    website?: string;
    slogan?: string;
    intro?: string;
  };
  bizPositioning: {
    coreBizIntro?: string;
    positioning?: string;
    targetCustomer?: string;
    differentialAdvantage?: string;
    brandStory?: string;
  };
  productService: {
    mainProducts?: string;
    sellPoints?: string;
    priceRange?: string;
    seoKeywords?: string[];
    serviceProcess?: string;
  };
  competitorMarket: {
    competitors?: string;
    marketEnv?: string;
    comparisonAdvantage?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    wechat?: string;
    weibo?: string;
    zhihu?: string;
    douyin?: string;
  };
  specialRequirements?: string;
  raw: WebsiteData;
}

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  // 行业关键词映射
  private readonly industryKeywords: Record<string, string[]> = {
    technology: ['科技', '技术', '软件', '云计算', 'ai', '人工智能', '数据', 'tech', 'software', '系统', '解决方案'],
    ecommerce: ['电商', '购物', '商城', '零售', 'shop', 'store', 'mall', '天猫', '京东'],
    education: ['教育', '培训', '学校', '学习', 'edu', 'education', 'course', '课程', '教学'],
    healthcare: ['医疗', '健康', '医院', '医药', 'health', 'medical', 'clinic', '保健'],
    finance: ['金融', '银行', '保险', '投资', 'finance', 'bank', 'insurance', '基金'],
    food: ['餐饮', '食品', '美食', '餐厅', 'food', 'restaurant', 'catering', '饮料'],
    manufacture: ['制造', '生产', '工厂', 'manufacture', '工业', '设备', '机械'],
    service: ['服务', '咨询', '代理', '中介', '外包'],
    real_estate: ['房产', '房地产', '地产', '装修', 'real estate', 'property', '建筑'],
    media: ['媒体', '广告', '传媒', '公关', '传播'],
    other: ['其他'],
  };

  // 公司规模关键词
  private readonly sizeKeywords: Record<string, RegExp[]> = {
    '1-10': [/\b1-10人\b/, /\b10人以下\b/, /\b小微企业\b/],
    '11-50': [/\b10-50人\b/, /\b20-50人\b/],
    '51-200': [/\b50-200人\b/, /\b50-100人\b/],
    '201-500': [/\b200-500人\b/, /\b100-500人\b/],
    '501-1000': [/\b500-1000人\b/],
    '1000+': [/\b1000人以上\b/, /\b大型企业\b/, /\b集团\b/],
  };

  /**
   * 从URL抓取网站内容
   */
  async fetchWebsite(url: string): Promise<WebsiteData> {
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = 'https://' + url;
    }

    try {
      this.logger.log(`Fetching website: ${normalizedUrl}`);

      const response = await axios.get(normalizedUrl, {
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        maxContentLength: 10 * 1024 * 1024,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // 移除无关标签但保留主要内容
      $('script, style, noscript, iframe, nav, header, footer, .navigation, .menu, .sidebar, .ad, .advertisement, .comment').remove();
      $('[class*="nav"], [class*="menu"], [class*="sidebar"], [class*="footer"], [class*="header"]').remove();
      $('[id*="nav"], [id*="menu"], [id*="sidebar"], [id*="footer"], [id*="header"]').remove();

      // 提取基本信息
      const title = $('title').text().trim() ||
                   $('meta[property="og:title"]').attr('content') ||
                   '';

      const description = $('meta[name="description"]').attr('content') ||
                        $('meta[property="og:description"]').attr('content') ||
                        '';

      const keywords = this.parseKeywords($('meta[name="keywords"]').attr('content') || '');

      // 提取标题标签
      const h1 = $('h1').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 2 && t.length < 100);
      const h2 = $('h2').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 2 && t.length < 100);
      const h3 = $('h3').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 2 && t.length < 100);

      // 提取正文内容 - 从 main, article, section 或 body
      let mainContent = '';
      const mainEl = $('main, article, [class*="content"], [class*="main"]').first();
      if (mainEl.length > 0) {
        mainContent = mainEl.text();
      } else {
        mainContent = $('body').text();
      }
      mainContent = this.cleanText(mainContent).substring(0, 8000);

      // 提取关于页面或关于区域
      let aboutContent = '';
      const aboutEl = $('[class*="about"], [id*="about"], [class*="about-us"], [id*="about-us"]').first();
      if (aboutEl.length > 0) {
        aboutContent = this.cleanText(aboutEl.text()).substring(0, 3000);
      }

      // 提取底部联系信息
      let footerContent = '';
      const footerEl = $('footer, [class*="footer"], [id*="footer"]').first();
      if (footerEl.length > 0) {
        footerContent = this.cleanText(footerEl.text()).substring(0, 2000);
      }

      // 提取联系方式 - 从全页面文本
      const fullText = this.cleanText($('body').text());
      const contacts = this.extractContacts(fullText);

      // 提取社交媒体
      const social = this.extractSocialLinks($, normalizedUrl);

      const websiteData: WebsiteData = {
        title,
        description,
        keywords,
        h1,
        h2,
        h3,
        mainContent,
        aboutContent,
        footerContent,
        contacts,
        social,
      };

      this.logger.log(`Successfully fetched website: ${normalizedUrl}`);
      return websiteData;

    } catch (error: any) {
      this.logger.error(`Failed to fetch website ${normalizedUrl}: ${error.message}`);
      throw new Error(`网页解析失败，可能是网站无法访问或不支持抓取`);
    }
  }

  /**
   * 使用智能规则提取结构化信息
   */
  async extractStructuredData(websiteData: WebsiteData): Promise<AISuggestion> {
    const suggestion: AISuggestion = {
      basicInfo: {},
      bizPositioning: {},
      productService: {},
      competitorMarket: {},
      contact: {},
      raw: websiteData,
    };

    const title = websiteData.title || '';
    const description = websiteData.description || '';
    const mainContent = websiteData.mainContent || '';
    const aboutContent = websiteData.aboutContent || '';
    const footerContent = websiteData.footerContent || '';
    const allContent = `${aboutContent}\n${mainContent}\n${footerContent}`.substring(0, 10000);

    // 1. 提取公司名称 - 核心逻辑
    suggestion.basicInfo.companyName = this.extractCompanyName(title, aboutContent, mainContent, description);
    
    // 2. 提取公司简介
    suggestion.basicInfo.intro = this.extractCompanyIntro(description, aboutContent, mainContent);
    
    // 3. 推断行业
    suggestion.basicInfo.industry = this.inferIndustry(description + ' ' + websiteData.keywords.join(' '));
    
    // 4. 提取地区
    suggestion.basicInfo.companyRegion = this.extractRegion(allContent);
    
    // 5. 推断公司规模
    suggestion.basicInfo.companySize = this.inferCompanySize(allContent);
    
    // 6. 提取官网
    suggestion.basicInfo.website = websiteData.title ? this.extractWebsiteFromTitle(title) : '';
    
    // 7. 提取 slogan
    suggestion.basicInfo.slogan = this.extractSlogan(websiteData.h1, description, aboutContent);

    // 8. 核心业务介绍
    suggestion.bizPositioning.coreBizIntro = this.extractCoreBusiness(aboutContent, mainContent, websiteData.h1, websiteData.h2);
    
    // 9. 目标客户
    suggestion.bizPositioning.targetCustomer = this.extractTargetCustomer(allContent);
    
    // 10. 差异化优势
    suggestion.bizPositioning.differentialAdvantage = this.extractAdvantages(mainContent, aboutContent);

    // 11. 主要产品/服务
    suggestion.productService.mainProducts = this.extractProducts(mainContent, websiteData.h2);
    suggestion.productService.sellPoints = this.extractSellPoints(mainContent);
    
    // 12. SEO关键词
    suggestion.productService.seoKeywords = this.extractSEOKeywords(websiteData.keywords, mainContent);
    
    // 13. 服务流程
    suggestion.productService.serviceProcess = this.extractServiceProcess(mainContent);

    // 14. 联系方式
    suggestion.contact.phone = websiteData.contacts.phone;
    suggestion.contact.email = websiteData.contacts.email;
    suggestion.contact.address = websiteData.contacts.address;
    suggestion.contact.wechat = websiteData.social.wechat;
    suggestion.contact.weibo = websiteData.social.weibo;
    suggestion.contact.zhihu = websiteData.social.zhihu;
    suggestion.contact.douyin = websiteData.social.douyin;

    return suggestion;
  }

  /**
   * 从URL获取AI建议
   */
  async getAISuggestionFromUrl(url: string): Promise<AISuggestion> {
    const websiteData = await this.fetchWebsite(url);
    const suggestion = await this.extractStructuredData(websiteData);

    // 填充网站地址
    suggestion.basicInfo.website = url;

    return suggestion;
  }

  // ========== 私有辅助方法 ==========

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, '\n')
      .trim();
  }

  private parseKeywords(keywordsStr: string): string[] {
    if (!keywordsStr) return [];
    return keywordsStr
      .split(/[,，、;；|]/)
      .map(k => k.trim())
      .filter(k => k.length > 1 && k.length < 30)
      .slice(0, 30);
  }

  /**
   * 智能提取公司名称
   */
  private extractCompanyName(title: string, about: string, main: string, description: string): string {
    // 1. 尝试从 title 提取
    if (title) {
      // 常见格式: "公司名 - 官网" 或 "公司名 | 官网"
      let name = title
        .replace(/\s*[-_–—官网主页首页官方平台官方网站网站]\s*[-_|]?\s*.*$/i, '')
        .replace(/\s*[-_–—|]\s*$/, '')
        .trim();
      
      // 如果太长，可能是产品列表，再处理
      if (name.length > 30) {
        name = name.split(/[,，、]/)[0].trim();
      }
      
      if (name && name.length >= 2 && name.length <= 50) {
        return name;
      }
    }

    // 2. 从 meta description 提取
    if (description) {
      // 匹配 "XXX公司" 或 "XXX品牌" 模式
      const match = description.match(/^([^\s，,。]+(?:公司|品牌|集团|企业|工作室|机构|协会|中心|医院|学校|酒店|饭店|餐厅|商城))/);
      if (match) {
        return match[1];
      }
    }

    // 3. 从 about 内容提取
    if (about) {
      const match = about.match(/^([^\s，,。]+(?:公司|品牌|集团|企业|工作室|机构|协会|中心))/);
      if (match) {
        return match[1];
      }
    }

    // 4. 从 h1 提取
    if (main) {
      const lines = main.split('\n').filter(l => l.trim().length > 2);
      for (const line of lines.slice(0, 10)) {
        const match = line.match(/^([^\s，,。]+(?:公司|品牌|集团|企业|工作室|机构|协会|中心))/);
        if (match && match[1].length <= 30) {
          return match[1];
        }
      }
    }

    return '';
  }

  /**
   * 提取公司简介
   */
  private extractCompanyIntro(description: string, about: string, main: string): string {
    // 1. 优先使用 meta description
    if (description && description.length > 20) {
      return this.truncate(description, 500);
    }

    // 2. 从 about 内容提取第一段
    if (about) {
      const paragraphs = about.split(/[\n\r]+/).filter(p => p.trim().length > 50);
      if (paragraphs.length > 0) {
        return this.truncate(paragraphs[0], 500);
      }
    }

    // 3. 从正文提取
    if (main) {
      const paragraphs = main.split(/[\n\r]+/).filter(p => p.trim().length > 50);
      if (paragraphs.length > 0) {
        return this.truncate(paragraphs[0], 500);
      }
    }

    return '';
  }

  /**
   * 提取公司 slogan
   */
  private extractSlogan(h1: string[], description: string, about: string): string {
    const sources = [...h1, description, about].join(' ');
    
    // 匹配常见 slogan 模式
    const patterns = [
      /["""]([^"""]+)["""]/g,
      /['‘’]([^'']+)['‘’]/g,
      /(?:致力于|专注于|专业|秉承)[：:,，,]([^。，]+)/g,
      /(?:让|使|帮|为)[^，。]+(?:更|更容|更易)/g,
    ];

    for (const pattern of patterns) {
      const match = sources.match(pattern);
      if (match && match[1]) {
        const slogan = match[1].trim();
        if (slogan.length >= 5 && slogan.length <= 30) {
          return slogan;
        }
      }
    }

    return '';
  }

  /**
   * 推断行业
   */
  private inferIndustry(text: string): string {
    const lowerText = text.toLowerCase();
    
    for (const [industry, keywords] of Object.entries(this.industryKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        return industry;
      }
    }
    
    return 'other';
  }

  /**
   * 提取地区
   */
  private extractRegion(text: string): string {
    // 中国省份/城市匹配
    const regions = [
      '北京', '上海', '深圳', '广州', '杭州', '南京', '苏州', '成都', '武汉', '西安',
      '天津', '重庆', '青岛', '大连', '厦门', '长沙', '郑州', '济南', '合肥', '福州',
      '广东省', '浙江省', '江苏省', '四川省', '湖北省', '山东省', '河南省', '河北省',
    ];

    for (const region of regions) {
      if (text.includes(region)) {
        // 检查是否是地址上下文
        const patterns = [
          new RegExp(`${region}[^，。]*(?:市|区|县|省)`),
          new RegExp(`(?:位于|总部在|坐落于)[^，。]*${region}`),
        ];
        
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            return this.truncate(match[0], 30);
          }
        }
        return region;
      }
    }

    return '';
  }

  /**
   * 推断公司规模
   */
  private inferCompanySize(text: string): string {
    for (const [size, patterns] of Object.entries(this.sizeKeywords)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return size;
        }
      }
    }
    return '';
  }

  /**
   * 从 title 提取官网域名
   */
  private extractWebsiteFromTitle(title: string): string {
    const match = title.match(/(?:[-_]|官网|网站|主页)[：:\s]*(.+?)(?:\s|$)/);
    return match ? match[1].trim() : '';
  }

  /**
   * 提取核心业务
   */
  private extractCoreBusiness(about: string, main: string, h1: string[], h2: string[]): string {
    // 1. 从 h1/h2 组合提取
    const headings = [...h1, ...h2].join(' ');
    if (headings.length > 10) {
      return this.truncate(headings, 500);
    }

    // 2. 从关于页面提取
    if (about) {
      const paragraphs = about.split(/[\n\r]+/).filter(p => p.trim().length > 30);
      if (paragraphs.length > 0) {
        return this.truncate(paragraphs[0], 500);
      }
    }

    // 3. 从正文提取
    if (main) {
      const paragraphs = main.split(/[\n\r]+/).filter(p => p.trim().length > 30);
      if (paragraphs.length > 0) {
        return this.truncate(paragraphs[0], 500);
      }
    }

    return '';
  }

  /**
   * 提取目标客户
   */
  private extractTargetCustomer(text: string): string {
    const patterns = [
      /(?:面向|服务于|服务于|目标|主要针对|客户|受众)[：:\s]*(.+?)(?:\n|。|$)/gi,
      /(?:B端|C端|企业|个人|政府|学校|医院)[^\n。]{0,50}/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[0]) {
        return this.truncate(match[0], 200);
      }
    }

    return '';
  }

  /**
   * 提取差异化优势
   */
  private extractAdvantages(main: string, about: string): string {
    const content = about || main;
    
    const patterns = [
      /(?:优势|特点|特色|亮点|核心竞争力)[：:]([^\n。]+)/gi,
      /(?:不同于|区别于|相比)[^\n。]{0,100}/gi,
    ];

    const results: string[] = [];
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        results.push(...matches.slice(0, 3));
      }
    }

    if (results.length > 0) {
      return this.truncate(results.join('；'), 300);
    }

    return '';
  }

  /**
   * 提取产品/服务
   */
  private extractProducts(main: string, h2: string[]): string {
    // 优先从 h2 提取
    if (h2.length > 0) {
      const productH2 = h2.filter(h => 
        /产品|服务|方案|解决方案|业务/.test(h) && h.length < 50
      );
      if (productH2.length > 0) {
        return productH2.join('；');
      }
    }

    // 从正文提取
    const patterns = [
      /(?:主营|主要产品|服务范围|产品包括)[：:\s]*(.+?)(?:\n|。|$)/gi,
      /(?:产品|服务)[：:]\s*([^\n。]+)/gi,
    ];

    for (const pattern of patterns) {
      const match = main.match(pattern);
      if (match && match[1]) {
        return this.truncate(match[1], 500);
      }
    }

    return '';
  }

  /**
   * 提取产品卖点
   */
  private extractSellPoints(main: string): string {
    const patterns = [
      /(?:卖点|优势|特点|特色|亮点)[：:\s]*(.+?)(?:\n|。|$)/gi,
      /(?:为什么选择|选择我们的理由)[：:\s]*(.+?)(?:\n|。|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = main.match(pattern);
      if (matches && matches.length > 0) {
        return this.truncate(matches.join('；'), 300);
      }
    }

    return '';
  }

  /**
   * 提取SEO关键词
   */
  private extractSEOKeywords(metaKeywords: string[], main: string): string[] {
    // 优先使用 meta keywords
    if (metaKeywords.length > 0) {
      return metaKeywords.slice(0, 10);
    }

    // 从正文提取高频词
    const words = main.match(/[\u4e00-\u9fa5]{2,6}/g) || [];
    const wordCount: Record<string, number> = {};
    
    for (const word of words) {
      if (word.length >= 2 && word.length <= 6) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    }

    // 返回出现频率较高的词
    return Object.entries(wordCount)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * 提取服务流程
   */
  private extractServiceProcess(main: string): string {
    const patterns = [
      /(?:流程|步骤|过程)[：:\s]*([^\n]{50,500})/gi,
      /(?:第一步|第二步|第三步|首先|其次|然后)[^\n]{0,200}/gi,
    ];

    for (const pattern of patterns) {
      const match = main.match(pattern);
      if (match && match.length > 0) {
        return this.truncate(match.join('\n'), 300);
      }
    }

    return '';
  }

  /**
   * 提取联系方式
   */
  private extractContacts(text: string): { email?: string; phone?: string; address?: string; fax?: string } {
    const contacts: any = {};

    // 邮箱 - 更严格的匹配
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/g;
    const emailMatches = text.match(emailRegex);
    if (emailMatches) {
      // 过滤掉 noreply, example 等无效邮箱
      const validEmails = emailMatches.filter(e => 
        !/noreply|no-reply|example|test|xxx/i.test(e)
      );
      if (validEmails.length > 0) {
        contacts.email = validEmails[0];
      }
    }

    // 电话 - 改进正则，匹配各种格式
    const phonePatterns = [
      // 手机号
      /(?:手机|TEL|Mobile)[：:\s]*(?:\+86[- ]?)?1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}/gi,
      /(?:手机|TEL|Mobile)[：:\s]*(?:\+86[- ]?)?1[3-9]\d{10}/gi,
      // 座机
      /(?:电话|TEL|Phone)[：:\s]*(?:\+86[- ]?)?0\d{2,3}[\s-]?\d{7,8}/gi,
      // 纯手机号
      /(?:\+86[- ]?)?1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}/g,
      // 纯座机
      /(?:\+86[- ]?)?0\d{2,3}[\s-]?\d{7,8}/g,
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match && match[0]) {
        // 清理电话号码
        let phone = match[0]
          .replace(/(?:手机|TEL|Mobile|电话|Phone)[：:\s]*/gi, '')
          .replace(/\s+/g, '')
          .trim();
        
        if (phone.length >= 7) {
          contacts.phone = phone;
          break;
        }
      }
    }

    // 地址
    const addressPatterns = [
      /(?:地址|地址：|公司地址|总部地址|地址ADD)[：:\s]*(.+?)(?:\n|·|$)/gi,
      /(?:Location|Address)[：:\s]*(.+?)(?:\n|$)/gi,
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const address = match[1].trim().substring(0, 100);
        if (address.length > 5) {
          contacts.address = address;
          break;
        }
      }
    }

    // 传真
    const faxMatch = text.match(/(?:传真|Fax)[：:\s]*(?:\+86[- ]?)?0\d{2,3}[\s-]?\d{7,8}/i);
    if (faxMatch) {
      contacts.fax = faxMatch[0];
    }

    return contacts;
  }

  /**
   * 提取社交媒体链接
   */
  private extractSocialLinks($: any, baseUrl: string): any {
    const social: any = {};

    $('a[href]').each((_: any, el: any) => {
      const href = $(el).attr('href') || '';
      const hrefLower = href.toLowerCase();
      const text = $(el).text().toLowerCase();

      if (hrefLower.includes('weibo.com') || hrefLower.includes('weibo.cn')) {
        social.weibo = href;
      } else if (hrefLower.includes('mp.weixin.qq.com') || hrefLower.includes('weixin') || text.includes('微信')) {
        social.wechat = href || text;
      } else if (hrefLower.includes('zhihu.com')) {
        social.zhihu = href;
      } else if (hrefLower.includes('douyin.com') || hrefLower.includes('tiktok')) {
        social.douyin = href;
      } else if (hrefLower.includes('linkedin.com')) {
        social.linkedin = href;
      }
    });

    return social;
  }

  private truncate(str: string, maxLength: number): string {
    if (!str) return '';
    if (str.length <= maxLength) return str.trim();
    return str.substring(0, maxLength - 3).trim() + '...';
  }
}
