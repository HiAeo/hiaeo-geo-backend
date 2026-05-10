import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../../knowledge/entities/brand-knowledge-base.entity';
import {
  GenerateSeoArticleDto,
  GenerateFaqDto,
  GenerateProductDescriptionDto,
} from '../dto/content-generation.dto';

/**
 * 知识库感知内容生成服务
 * 从知识库获取上下文，生成符合品牌规范的内容
 */
@Injectable()
export class KnowledgeAwareContentService {
  private readonly logger = new Logger(KnowledgeAwareContentService.name);

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
  ) {}

  /**
   * 从知识库构建SEO文章生成参数
   */
  async buildSeoArticleContext(
    organizationId: string,
    customKeyword?: string,
  ): Promise<GenerateSeoArticleDto | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      this.logger.warn(`未找到知识库: ${organizationId}`);
      return null;
    }

    const keyword = customKeyword || this.getPrimaryKeyword(knowledge);

    if (!keyword) {
      this.logger.warn(`知识库缺少关键词信息: ${organizationId}`);
      return null;
    }

    return {
      brandName: this.getBrandName(knowledge),
      keyword,
      longTailKeywords: this.getLongTailKeywords(knowledge),
      targetWordCount: 1500,
      brandInfo: this.getBrandInfo(knowledge),
      competitors: this.getCompetitorNames(knowledge),
    };
  }

  /**
   * 从知识库构建FAQ生成参数
   */
  async buildFaqContext(
    organizationId: string,
    faqType: 'product' | 'service' | 'brand' | 'general' = 'brand',
  ): Promise<GenerateFaqDto | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return null;
    }

    return {
      name: this.getBrandName(knowledge),
      faqType,
      questionCount: 10,
      targetAudience: this.getTargetAudience(knowledge),
    };
  }

  /**
   * 从知识库构建产品描述生成参数
   */
  async buildProductDescriptionContext(
    organizationId: string,
    productName?: string,
  ): Promise<GenerateProductDescriptionDto | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return null;
    }

    // 如果没有指定产品名，尝试获取第一个产品
    const targetProduct = productName
      ? knowledge.productService?.productServiceList?.find(
          (p: any) => p.productName === productName,
        )
      : knowledge.productService?.productServiceList?.[0];

    if (!targetProduct) {
      return null;
    }

    return {
      productName: (targetProduct as any).productName || productName,
      category: knowledge.basicInfo?.industry || '',
      features: (targetProduct as any).productDesc || knowledge.productService?.productSellPoint,
      targetAudience: this.getTargetAudience(knowledge),
      brandName: this.getBrandName(knowledge),
    };
  }

  /**
   * 获取内容禁忌词列表
   * 用于内容审核和生成时的过滤
   */
  async getForbiddenWords(organizationId: string): Promise<string[]> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return [];
    }

    const words: Set<string> = new Set();

    // 品牌禁忌词
    if (knowledge.supplement?.brandForbiddenWords) {
      knowledge.supplement.brandForbiddenWords
        .split(/[,，]/)
        .filter(Boolean)
        .forEach((w) => words.add(w));
    }

    // 禁止推广业务
    if (knowledge.bizPositioning?.forbiddenBiz) {
      // 提取可能的禁忌词
      const matches = knowledge.bizPositioning.forbiddenBiz.match(/[^\s,，]+/g);
      if (matches) {
        matches.forEach((w) => words.add(w));
      }
    }

    // 合规要求中的敏感词
    if (knowledge.supplement?.complianceRequirements) {
      const matches = knowledge.supplement.complianceRequirements.match(/[^\s,，]+/g);
      if (matches) {
        matches.forEach((w) => words.add(w));
      }
    }

    return Array.from(words);
  }

  /**
   * 检查内容是否包含禁忌词
   */
  async checkContentAgainstKnowledge(
    organizationId: string,
    content: string,
  ): Promise<{
    hasViolation: boolean;
    foundWords: string[];
    suggestions: string[];
  }> {
    const forbiddenWords = await this.getForbiddenWords(organizationId);

    if (forbiddenWords.length === 0) {
      return { hasViolation: false, foundWords: [], suggestions: [] };
    }

    const foundWords = forbiddenWords.filter((word) => content.includes(word));

    const suggestions: string[] = [];
    if (foundWords.length > 0) {
      suggestions.push(`内容包含 ${foundWords.length} 个禁忌词，请修改后重试`);
      suggestions.push(`禁忌词列表: ${foundWords.join(', ')}`);
    }

    return {
      hasViolation: foundWords.length > 0,
      foundWords,
      suggestions,
    };
  }

  /**
   * 获取品牌的差异化优势
   * 用于内容生成时的卖点强调
   */
  async getDifferentialAdvantage(organizationId: string): Promise<string | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    return knowledge?.bizPositioning?.differentialAdvantage || null;
  }

  /**
   * 获取品牌核心信息摘要
   */
  async getBrandSummary(organizationId: string): Promise<{
    name: string;
    industry: string;
    coreBiz: string;
    targetAudience: string;
    highlights: string[];
  } | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return null;
    }

    const highlights: string[] = [];

    if (knowledge.bizPositioning?.differentialAdvantage) {
      highlights.push(knowledge.bizPositioning.differentialAdvantage);
    }

    if (knowledge.basicInfo?.companyScale) {
      highlights.push(`企业规模: ${knowledge.basicInfo.companyScale}`);
    }

    return {
      name: this.getBrandName(knowledge),
      industry: knowledge.basicInfo?.industry || '',
      coreBiz: knowledge.bizPositioning?.coreBizIntro || '',
      targetAudience: this.getTargetAudience(knowledge),
      highlights,
    };
  }

  // ==================== 私有辅助方法 ====================

  private getBrandName(knowledge: BrandKnowledgeBase): string {
    return (
      knowledge.basicInfo?.companyShortName ||
      knowledge.basicInfo?.companyName ||
      '未命名品牌'
    );
  }

  private getPrimaryKeyword(knowledge: BrandKnowledgeBase): string | null {
    // 优先使用产品关键词
    if (knowledge.productService?.coreKeywords && knowledge.productService.coreKeywords.length > 0) {
      return knowledge.productService.coreKeywords[0];
    }

    // 其次使用行业+品牌名
    if (knowledge.basicInfo?.industry) {
      const brandName = this.getBrandName(knowledge);
      return `${knowledge.basicInfo.industry} ${brandName}`;
    }

    return null;
  }

  private getLongTailKeywords(knowledge: BrandKnowledgeBase): string {
    if (!knowledge.productService?.coreKeywords) {
      return '';
    }

    const brandName = this.getBrandName(knowledge);
    const keywords = knowledge.productService.coreKeywords.slice(0, 5);

    return keywords.map((k) => `${k} ${brandName}`).join(', ');
  }

  private getBrandInfo(knowledge: BrandKnowledgeBase): string {
    const parts: string[] = [];

    if (knowledge.basicInfo?.companyShortName) {
      parts.push(knowledge.basicInfo.companyShortName);
    }

    if (knowledge.basicInfo?.industry) {
      parts.push(knowledge.basicInfo.industry);
    }

    if (knowledge.bizPositioning?.coreBizIntro) {
      parts.push(knowledge.bizPositioning.coreBizIntro);
    }

    if (knowledge.bizPositioning?.differentialAdvantage) {
      parts.push(`优势: ${knowledge.bizPositioning.differentialAdvantage}`);
    }

    return parts.join(' | ');
  }

  private getCompetitorNames(knowledge: BrandKnowledgeBase): string | undefined {
    if (!knowledge.competitorMarket?.competitors) {
      return undefined;
    }

    return knowledge.competitorMarket.competitors
      .map((c: any) => c.competitorName)
      .filter(Boolean)
      .join(', ');
  }

  private getTargetAudience(knowledge: BrandKnowledgeBase): string {
    return (
      knowledge.bizPositioning?.targetCustomer ||
      knowledge.bizPositioning?.targetCustomer ||
      ''
    );
  }
}
