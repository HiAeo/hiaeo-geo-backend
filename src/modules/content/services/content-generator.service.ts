import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/services/ai.service';
import { GenerateSeoArticleDto, GenerateFaqDto, GenerateJsonLdDto, GenerateProductDescriptionDto } from '../dto/content-generation.dto';

export interface GeneratedContent {
  title: string;
  body: string;
  type: string;
  metaDescription?: string;
  keywords?: string[];
  suggestions?: string[];
}

export interface SeoArticleResult {
  title: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  headings: { level: number; text: string }[];
  wordCount: number;
  readingTime: number;
}

export interface FaqResult {
  name: string;
  faqs: { question: string; answer: string }[];
  jsonLd: string;
}

export interface JsonLdResult {
  schemaType: string;
  schema: Record<string, any>;
  script: string;
}

export interface ProductDescriptionResult {
  productName: string;
  shortDescription: string;
  longDescription: string;
  features: string[];
  useCases: string[];
  specifications: { name: string; value: string }[];
}

@Injectable()
export class ContentGeneratorService {
  constructor(private aiService: AiService) {}

  /**
   * 生成SEO文章
   */
  async generateSeoArticle(dto: GenerateSeoArticleDto): Promise<SeoArticleResult> {
    const { brandName, keyword, longTailKeywords, targetWordCount = 1500, brandInfo, competitors } = dto;
    
    const prompt = this.buildSeoArticlePrompt({
      brandName,
      keyword,
      longTailKeywords,
      targetWordCount,
      brandInfo,
      competitors,
    });

    try {
      const result = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
      }, 'deepseek');

      return this.parseSeoArticleResult(result.message.content, keyword);
    } catch (error) {
      // 如果AI调用失败，返回示例内容
      return this.getSampleSeoArticle(keyword, brandName);
    }
  }

  /**
   * 生成FAQ
   */
  async generateFaq(dto: GenerateFaqDto): Promise<FaqResult> {
    const { name, faqType, questionCount = 10, targetAudience } = dto;

    const prompt = this.buildFaqPrompt({ name, faqType, questionCount, targetAudience });

    try {
      const result = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
      }, 'deepseek');

      const faqs = this.parseFaqResult(result.message.content);
      const jsonLd = this.generateFaqJsonLd(name, faqs);

      return { name, faqs, jsonLd };
    } catch (error) {
      return this.getSampleFaq(name, faqType);
    }
  }

  /**
   * 生成JSON-LD结构化数据
   */
  async generateJsonLd(dto: GenerateJsonLdDto): Promise<JsonLdResult> {
    const { schemaType, name, websiteUrl, logoUrl, contactEmail, socialLinks, description, price } = dto;

    const schema = this.buildJsonLdSchema({
      schemaType,
      name,
      websiteUrl,
      logoUrl,
      contactEmail,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined,
      description,
      price,
    });

    const script = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;

    return { schemaType, schema, script };
  }

  /**
   * 生成产品描述
   */
  async generateProductDescription(dto: GenerateProductDescriptionDto): Promise<ProductDescriptionResult> {
    const { productName, category, features, targetAudience, brandName } = dto;

    const prompt = this.buildProductDescriptionPrompt({ productName, category, features, targetAudience, brandName });

    try {
      const result = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
      }, 'deepseek');

      return this.parseProductDescriptionResult(result.message.content, productName);
    } catch (error) {
      return this.getSampleProductDescription(productName, category);
    }
  }

  /**
   * 检查敏感词
   */
  async checkSensitiveWords(content: string): Promise<{ hasSensitive: boolean; words: string[] }> {
    // 简单的敏感词检测示例
    const sensitiveWords = ['违规', '违法', '欺诈', '诈骗', '虚假', '骗人'];
    const foundWords = sensitiveWords.filter(word => content.includes(word));
    
    return {
      hasSensitive: foundWords.length > 0,
      words: foundWords,
    };
  }

  /**
   * 优化内容
   */
  async optimizeContent(content: string, type: string = 'general'): Promise<string> {
    const prompt = `请优化以下${type === 'seo' ? 'SEO' : ''}内容，使其更加流畅、专业：

${content}

请直接返回优化后的内容，不需要解释。`;

    try {
      const result = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
      }, 'deepseek');
      return result.message.content;
    } catch (error) {
      return content;
    }
  }

  // ==================== 私有方法 ====================

  private buildSeoArticlePrompt(params: {
    brandName: string;
    keyword: string;
    longTailKeywords?: string;
    targetWordCount: number;
    brandInfo?: string;
    competitors?: string;
  }): string {
    return `请为"${params.brandName}"品牌撰写一篇高质量的SEO文章。

核心关键词：${params.keyword}
${params.longTailKeywords ? `长尾关键词：${params.longTailKeywords}` : ''}
目标字数：${params.targetWordCount}字
${params.brandInfo ? `品牌信息：${params.brandInfo}` : ''}
${params.competitors ? `主要竞争对手：${params.competitors}` : ''}

要求：
1. 文章标题包含核心关键词
2. 结构清晰，包含H2/H3标题
3. 开头100字内包含核心关键词
4. 内容专业、有价值、自然融入关键词
5. 结尾包含总结和行动号召
6. 直接返回文章内容，不需要额外说明`;
  }

  private buildFaqPrompt(params: {
    name: string;
    faqType: string;
    questionCount: number;
    targetAudience?: string;
  }): string {
    return `请为"${params.name}"生成${params.questionCount}个高质量的FAQ问答对。

FAQ类型：${params.faqType === 'product' ? '产品常见问题' : params.faqType === 'service' ? '服务常见问题' : params.faqType === 'brand' ? '品牌常见问题' : '通用常见问题'}
${params.targetAudience ? `目标用户：${params.targetAudience}` : ''}

要求：
1. 问题真实常见，用户会搜索的
2. 回答简洁明了，100字以内
3. 涵盖功能、使用、购买、售后等方面
4. 格式：Q1: 问题\nA1: 回答`;
  }

  private buildProductDescriptionPrompt(params: {
    productName: string;
    category: string;
    features?: string;
    targetAudience?: string;
    brandName?: string;
  }): string {
    return `请为以下产品生成营销描述：

产品名称：${params.productName}
产品类别：${params.category}
${params.features ? `产品特点：${params.features}` : ''}
${params.targetAudience ? `目标用户：${params.targetAudience}` : ''}
${params.brandName ? `品牌：${params.brandName}` : ''}

要求：
1. 短描述：50字以内，吸引点击
2. 长描述：200字以内，详细介绍
3. 列出5个核心卖点
4. 列出3个使用场景
5. 列出产品参数规格
6. 格式清晰，使用Markdown`;
  }

  private buildJsonLdSchema(params: {
    schemaType: string;
    name: string;
    websiteUrl?: string;
    logoUrl?: string;
    contactEmail?: string;
    socialLinks?: Record<string, string>;
    description?: string;
    price?: string;
  }): Record<string, any> {
    const baseSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': params.schemaType,
      name: params.name,
    };

    switch (params.schemaType) {
      case 'Organization':
        return {
          ...baseSchema,
          url: params.websiteUrl,
          logo: params.logoUrl,
          email: params.contactEmail,
          description: params.description,
          ...(params.socialLinks && {
            sameAs: Object.values(params.socialLinks),
          }),
        };

      case 'LocalBusiness':
        return {
          ...baseSchema,
          url: params.websiteUrl,
          logo: params.logoUrl,
          description: params.description,
          contactPoint: {
            '@type': 'ContactPoint',
            email: params.contactEmail,
            contactType: 'customer service',
          },
        };

      case 'Product':
        return {
          ...baseSchema,
          description: params.description,
          brand: { '@type': 'Brand', name: params.name },
          ...(params.price && { offers: { '@type': 'Offer', price: params.price, priceCurrency: 'CNY' } }),
        };

      case 'Article':
        return {
          ...baseSchema,
          headline: params.name,
          description: params.description,
          datePublished: new Date().toISOString(),
          author: { '@type': 'Organization', name: params.name },
        };

      case 'FAQPage':
        return {
          ...baseSchema,
          mainEntity: [],
        };

      case 'BreadcrumbList':
        return {
          ...baseSchema,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首页', item: params.websiteUrl },
          ],
        };

      default:
        return baseSchema;
    }
  }

  private parseSeoArticleResult(content: string, keyword: string): SeoArticleResult {
    // 简单解析，提取标题和内容
    const lines = content.split('\n');
    const title = lines[0]?.replace(/^#+\s*/, '').trim() || `${keyword}完整指南`;
    
    // 计算字数
    const wordCount = content.replace(/[#\n\r]/g, '').length;
    
    // 提取标题层级
    const headings: { level: number; text: string }[] = [];
    lines.forEach(line => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({ level: match[1].length, text: match[2] });
      }
    });

    return {
      title,
      content,
      metaDescription: content.substring(0, 160).replace(/[#\n\r]/g, '').trim(),
      keywords: [keyword],
      headings,
      wordCount,
      readingTime: Math.ceil(wordCount / 400),
    };
  }

  private parseFaqResult(content: string): { question: string; answer: string }[] {
    const faqs: { question: string; answer: string }[] = [];
    const pairs = content.split(/\n\n|Q\d+:|A\d+:/).filter(Boolean);
    
    for (let i = 0; i < pairs.length; i += 2) {
      const question = pairs[i]?.trim().replace(/^Q\d+:\s*/, '');
      const answer = pairs[i + 1]?.trim().replace(/^A\d+:\s*/, '');
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }

    // 如果解析失败，返回示例
    if (faqs.length === 0) {
      return [
        { question: '这是什么产品/服务？', answer: '这是为您提供的专业产品/服务，具有高质量和可靠性。' },
        { question: '如何使用？', answer: '您可以通过以下步骤开始使用...' },
      ];
    }

    return faqs;
  }

  private generateFaqJsonLd(name: string, faqs: { question: string; answer: string }[]): string {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  }

  private parseProductDescriptionResult(content: string, productName: string): ProductDescriptionResult {
    return {
      productName,
      shortDescription: '高质量专业产品，为您提供最佳解决方案。',
      longDescription: content.substring(0, 500),
      features: ['特点1', '特点2', '特点3', '特点4', '特点5'],
      useCases: ['场景1', '场景2', '场景3'],
      specifications: [
        { name: '规格1', value: '值1' },
        { name: '规格2', value: '值2' },
      ],
    };
  }

  private getSampleSeoArticle(keyword: string, brandName: string): SeoArticleResult {
    return {
      title: `${keyword}完整指南 - ${brandName}专业解读`,
      content: `# ${keyword}完整指南

## 什么是${keyword}？

${keyword}是当前行业内的重要概念，对于企业品牌建设具有重要意义。本指南将为您详细介绍...

## ${keyword}的核心要点

### 1. 基础知识
了解${keyword}的基本概念是第一步...

### 2. 应用场景
${keyword}广泛应用于多个领域...

### 3. 最佳实践
以下是业内公认的${keyword}最佳实践...

## 总结

通过本文，您已经了解了${keyword}的核心内容。希望这份指南对您有所帮助。`,
      metaDescription: `了解${keyword}的完整指南，${brandName}为您提供专业的解读和最佳实践。`,
      keywords: [keyword, `${keyword}指南`, `${keyword}教程`],
      headings: [
        { level: 1, text: `${keyword}完整指南` },
        { level: 2, text: '什么是' + keyword + '？' },
        { level: 2, text: keyword + '的核心要点' },
        { level: 3, text: '基础知识' },
        { level: 3, text: '应用场景' },
        { level: 3, text: '最佳实践' },
        { level: 2, text: '总结' },
      ],
      wordCount: 800,
      readingTime: 4,
    };
  }

  private getSampleFaq(name: string, type: string): FaqResult {
    const faqs = [
      { question: `${name}是什么？`, answer: `${name}是一款专业的产品/服务，为用户提供高质量的解决方案。` },
      { question: `如何开始使用${name}？`, answer: `您可以通过注册账号、选择套餐、开始使用三个简单步骤开始使用${name}。` },
      { question: `${name}的收费方式是怎样的？`, answer: `${name}提供多种套餐选择，满足不同用户需求。具体价格请查看我们的套餐页面。` },
      { question: `如何联系客服？`, answer: `您可以通过邮件、在线客服或电话联系我们，客服团队将在24小时内回复您。` },
      { question: `${name}适合哪些用户？`, answer: `${name}适合各类企业、个人创作者和营销团队使用。` },
    ];

    return {
      name,
      faqs,
      jsonLd: this.generateFaqJsonLd(name, faqs),
    };
  }

  private getSampleProductDescription(productName: string, category: string): ProductDescriptionResult {
    return {
      productName,
      shortDescription: `专业的${category}产品，为您提供卓越的性能和体验。`,
      longDescription: `${productName}是市面上领先的${category}解决方案，采用先进技术和优质材料，为用户带来出色的使用体验。`,
      features: [
        '高性能处理器，运行流畅',
        '人性化设计，操作简便',
        '安全可靠，品质保障',
        '专业服务，售后无忧',
        '持续更新，功能丰富',
      ],
      useCases: [
        '日常办公，提升效率',
        '专业创作，激发灵感',
        '企业管理，协同办公',
      ],
      specifications: [
        { name: '材质', value: '优质材料' },
        { name: '尺寸', value: '标准规格' },
        { name: '保修', value: '一年质保' },
      ],
    };
  }
}
