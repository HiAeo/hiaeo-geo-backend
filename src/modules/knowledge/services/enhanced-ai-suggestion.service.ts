import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { AiService } from '../../ai/services/ai.service';
import { EmbeddingService } from './embedding.service';

/**
 * 增强的 AI 智能建议服务
 * 基于知识库内容和 AI 服务提供个性化建议
 */
@Injectable()
export class EnhancedAiSuggestionService {
  private readonly logger = new Logger(EnhancedAiSuggestionService.name);

  // 建议字段映射
  private readonly FIELD_PROMPTS: Record<string, {
    prompt: string;
    examples?: string[];
  }> = {
    companyName: {
      prompt: '分析公司名称的SEO友好度和品牌辨识度',
      examples: ['示例: 深圳市腾讯计算机系统有限公司 → 腾讯', '建议使用简短、有辨识度的名称'],
    },
    industry: {
      prompt: '根据公司业务描述，判断最合适的行业分类',
      examples: ['科技', '教育', '医疗健康', '金融科技'],
    },
    coreBizIntro: {
      prompt: '为核心业务描述提供SEO优化建议',
      examples: ['控制在50字以内', '突出差异化价值', '包含核心关键词'],
    },
    targetCustomer: {
      prompt: '分析目标客户画像的精准度',
      examples: ['ToB-中大型企业-IT部门', 'ToC-25-35岁-都市白领'],
    },
    productName: {
      prompt: '评估产品名称的搜索优化潜力',
    },
    differentialAdvantage: {
      prompt: '分析差异化优势的表述和吸引力',
      examples: ['技术优势', '价格优势', '服务优势', '品牌优势'],
    },
    competitorName: {
      prompt: '分析竞品名称的SEO相关性和完整性',
    },
    keyword: {
      prompt: '评估关键词的搜索量和竞争程度',
    },
  };

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
    private aiService: AiService,
    private embeddingService: EmbeddingService,
  ) {}

  /**
   * 获取字段填写建议
   */
  async getFieldSuggestion(
    organizationId: string,
    field: string,
  ): Promise<{
    suggestion: string;
    confidence: number;
    tips: string[];
    examples: string[];
  }> {
    // 获取当前知识库上下文
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    // 构建上下文感知的提示
    const contextPrompt = this.buildContextPrompt(field, knowledge);

    try {
      // 调用 AI 服务生成建议
      const result = await this.aiService.chat(
        {
          messages: [
            {
              role: 'user',
              content: contextPrompt,
            },
          ],
          systemPrompt: '你是一个专业的品牌策略顾问，擅长SEO优化和内容营销。',
          temperature: 0.7,
          maxTokens: 500,
        },
        'deepseek',
      );

      return this.parseAiResponse(result.message.content, field);
    } catch (error) {
      this.logger.error(`AI建议生成失败: ${error.message}`, error.stack);
      // 返回降级建议
      return this.getFallbackSuggestion(field);
    }
  }

  /**
   * 从 URL 提取信息并智能填充
   * 支持抓取网页内容并提取结构化信息
   */
  async extractFromUrl(
    organizationId: string,
    url: string,
    targetField: string,
  ): Promise<{
    extracted: string;
    confidence: number;
    source: string;
    suggestion: string;
  }> {
    // 获取知识库上下文，用于更精准的提取
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    // 判断是否为全字段提取模式
    const isAllFields = targetField === 'all';

    // 首先抓取网页内容
    let webContent = '';
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        maxRedirects: 5,
      });

      // 使用 cheerio 解析 HTML
      const $ = cheerio.load(response.data);

      // 移除 script、style、noscript 等无用标签
      $('script, style, noscript, iframe, nav, footer, header, [class*="nav"], [class*="menu"], [class*="footer"], [class*="header"]').remove();

      // 提取主要文本内容
      webContent = $('body').text().trim();

      // 清理多余的空白字符
      webContent = webContent.replace(/\s+/g, ' ').trim();

      // 限制内容长度，避免 token 过多
      if (webContent.length > 8000) {
        webContent = webContent.substring(0, 8000) + '...';
      }

      this.logger.log(`成功抓取网页内容，长度: ${webContent.length} 字符`);
    } catch (error) {
      this.logger.warn(`网页抓取失败: ${error.message}，使用备用方案`);
      webContent = '';
    }

    // 构建提取提示
    let prompt = '';
    if (isAllFields) {
      // 全字段提取模式 - 从企业官网提取所有知识库字段
      const currentInfo = knowledge ? this.getCurrentFieldValuesFromKnowledge(knowledge) : {};
      prompt = `你是一个专业的品牌信息提取专家。请从以下企业官网内容中提取完整的品牌知识库信息。

现有知识库内容（如有）：
${JSON.stringify(currentInfo, null, 2)}

请提取以下所有字段的信息：
1. companyName - 公司全称
2. companyShortName - 公司简称/品牌名
3. industry - 所属行业
4. companyRegion - 公司所在地区
5. mainBizArea - 主要业务领域
6. companyScale - 公司规模
7. website - 公司官网（当前URL）
8. socialMedia - 社交媒体账号
9. contactName - 联系人姓名
10. contactPhone - 联系电话
11. contactEmail - 联系邮箱
12. coreBizIntro - 核心业务介绍（一句话概括）
13. targetCustomer - 目标客户画像
14. customerPainPoint - 客户痛点
15. differentialAdvantage - 差异化优势
16. forbiddenBiz - 禁止涉及的业务（如无则留空）
17. productServiceList - 产品/服务列表（JSON数组）
18. productSellPoint - 产品卖点
19. serviceDetails - 服务详情
20. coreKeywords - 核心关键词（JSON数组）

网页内容：
${webContent || '【无法抓取网页内容，请根据URL推断公司信息】'}

请以JSON格式返回：
{
  "extracted": {
    "companyName": "...",
    "companyShortName": "...",
    "industry": "...",
    "companyRegion": "...",
    "mainBizArea": "...",
    "companyScale": "...",
    "website": "${url}",
    "socialMedia": "...",
    "contactName": "...",
    "contactPhone": "...",
    "contactEmail": "...",
    "coreBizIntro": "...",
    "targetCustomer": "...",
    "customerPainPoint": "...",
    "differentialAdvantage": "...",
    "forbiddenBiz": "",
    "productServiceList": [],
    "productSellPoint": "...",
    "serviceDetails": "...",
    "coreKeywords": [],
    "files": []
  },
  "confidence": 0.0-1.0之间的整体置信度,
  "suggestion": "对提取结果的优化建议"
}`;
    } else {
      // 单字段提取模式
      prompt = `请分析以下网页内容，提取与 "${targetField}" 相关的信息：

网页内容：
${webContent || '【无法抓取网页内容】'}

URL: ${url}

请以JSON格式返回：
{
  "extracted": "提取的信息（如果没有找到相关信息则为空字符串）",
  "confidence": 0.0-1.0之间的置信度,
  "suggestion": "对该信息的优化建议"
}`;
    }

    try {
      this.logger.log(`开始调用 DeepSeek AI 分析网页内容...`);
      
      const result = await this.aiService.chat(
        {
          messages: [{ role: 'user', content: prompt }],
        },
        'deepseek',
      );

      this.logger.log(`AI 返回结果: ${JSON.stringify(result.message.content).substring(0, 500)}...`);

      const parsed = this.parseJsonResponse(result.message.content);
      
      this.logger.log(`解析后的结果: ${JSON.stringify(parsed).substring(0, 500)}...`);

      return {
        extracted: parsed.extracted || '',
        confidence: parsed.confidence || 0.5,
        source: url,
        suggestion: parsed.suggestion || '请核对提取的信息是否准确',
      };
    } catch (error) {
      this.logger.error(`URL信息提取失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 从知识库获取当前字段值（用于对比和补充）
   */
  private getCurrentFieldValuesFromKnowledge(knowledge: BrandKnowledgeBase): Record<string, any> {
    const result: Record<string, any> = {};

    if (!knowledge) return result;

    // 基础信息
    if (knowledge.basicInfo) {
      result.companyName = knowledge.basicInfo.companyName || '';
      result.companyShortName = knowledge.basicInfo.companyShortName || '';
      result.industry = knowledge.basicInfo.industry || '';
      result.companyRegion = knowledge.basicInfo.companyRegion || '';
      result.mainBizArea = knowledge.basicInfo.mainBizArea || '';
      result.companyScale = knowledge.basicInfo.companyScale || '';
      result.website = knowledge.basicInfo.website || '';
      result.socialMedia = knowledge.basicInfo.socialMedia || '';
      result.contactName = knowledge.basicInfo.contactName || '';
      result.contactPhone = knowledge.basicInfo.contactPhone || '';
      result.contactEmail = knowledge.basicInfo.contactEmail || '';
    }

    // 业务定位
    if (knowledge.bizPositioning) {
      result.coreBizIntro = knowledge.bizPositioning.coreBizIntro || '';
      result.targetCustomer = knowledge.bizPositioning.targetCustomer || '';
      result.customerPainPoint = knowledge.bizPositioning.customerPainPoint || '';
      result.differentialAdvantage = knowledge.bizPositioning.differentialAdvantage || '';
      result.forbiddenBiz = knowledge.bizPositioning.forbiddenBiz || '';
    }

    // 产品服务
    if (knowledge.productService) {
      result.productServiceList = knowledge.productService.productServiceList || [];
      result.productSellPoint = knowledge.productService.productSellPoint || '';
      result.serviceDetails = knowledge.productService.serviceDetails || '';
      result.coreKeywords = knowledge.productService.coreKeywords || [];
    }

    // 清理空值
    Object.keys(result).forEach(key => {
      if (result[key] === '' || result[key] === null || result[key] === undefined) {
        delete result[key];
      }
    });

    return result;
  }

  /**
   * 从文本内容提取关键信息
   */
  async extractFromText(
    organizationId: string,
    text: string,
    targetFields: string[],
  ): Promise<{
    results: Record<string, {
      extracted: string;
      confidence: number;
    }>;
    summary: string;
  }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    const currentInfo = this.getCurrentFieldValues(knowledge, targetFields);

    const prompt = `请分析以下文本内容，提取关键信息并与现有信息进行对比：

现有信息：
${JSON.stringify(currentInfo, null, 2)}

待分析文本：
${text}

目标字段：${targetFields.join(', ')}

请以JSON格式返回：
{
  "results": {
    "字段名": {
      "extracted": "提取的信息",
      "confidence": 0.0-1.0
    }
  },
  "summary": "整体分析摘要"
}`;

    try {
      const result = await this.aiService.chat(
        {
          messages: [{ role: 'user', content: prompt }],
        },
        'deepseek',
      );

      const parsed = this.parseJsonResponse(result.message.content);

      return {
        results: parsed.results || {},
        summary: parsed.summary || '分析完成',
      };
    } catch (error) {
      this.logger.error(`文本信息提取失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 生成知识库完整性评估报告
   */
  async generateCompletenessReport(
    organizationId: string,
  ): Promise<{
    overall: number;
    critical: number;
    sections: {
      name: string;
      score: number;
      status: 'good' | 'warning' | 'critical';
      suggestions: string[];
    }[];
    recommendations: string[];
  }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return {
        overall: 0,
        critical: 0,
        sections: [],
        recommendations: ['请先创建知识库'],
      };
    }

    const sections = this.analyzeSections(knowledge);
    const recommendations = this.generateRecommendations(sections);

    const overall = sections.reduce((sum, s) => sum + s.score, 0) / sections.length;
    const critical = sections
      .filter((s) => ['basicInfo', 'bizPositioning', 'productService'].includes(s.key))
      .reduce((sum, s) => sum + s.score, 0) /
      Math.max(1, sections.filter((s) => ['basicInfo', 'bizPositioning', 'productService'].includes(s.key)).length);

    return {
      overall,
      critical,
      sections: sections.map((s) => ({
        name: s.name,
        score: s.score,
        status: s.score >= 0.7 ? 'good' : s.score >= 0.4 ? 'warning' : 'critical',
        suggestions: s.suggestions,
      })),
      recommendations,
    };
  }

  /**
   * 生成 SEO 关键词建议
   */
  async suggestKeywords(organizationId: string): Promise<{
    primary: string[];
    secondary: string[];
    longTail: string[];
    competition: 'high' | 'medium' | 'low';
  }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return {
        primary: [],
        secondary: [],
        longTail: [],
        competition: 'medium',
      };
    }

    const context = this.buildKeywordContext(knowledge);

    const prompt = `基于以下品牌信息，推荐适合GEO优化的关键词：

${context}

请以JSON格式返回：
{
  "primary": ["核心关键词（1-3个）"],
  "secondary": ["次要关键词（3-5个）"],
  "longTail": ["长尾关键词（5-10个）"],
  "competition": "high/medium/low"
}`;

    try {
      const result = await this.aiService.chat(
        {
          messages: [{ role: 'user', content: prompt }],
        },
        'deepseek',
      );

      return this.parseJsonResponse(result.message.content);
    } catch (error) {
      this.logger.error(`关键词建议生成失败: ${error.message}`, error.stack);
      return this.getFallbackKeywords(knowledge);
    }
  }

  /**
   * 构建上下文感知的提示
   */
  private buildContextPrompt(field: string, knowledge: any): string {
    const fieldConfig = this.FIELD_PROMPTS[field] || {
      prompt: '提供字段填写建议',
    };

    const currentValue = this.getFieldValue(knowledge, field);

    let context = `请为以下字段提供填写建议：
字段名: ${field}
${fieldConfig.prompt}
${fieldConfig.examples ? `参考示例:\n${fieldConfig.examples.join('\n')}` : ''}`;

    if (currentValue) {
      context += `\n\n当前值: ${typeof currentValue === 'object' ? JSON.stringify(currentValue) : currentValue}`;
    }

    if (knowledge) {
      // 添加相关上下文
      const relatedFields = this.getRelatedFields(field);
      if (relatedFields.length > 0) {
        const relatedInfo = relatedFields
          .map((f) => `${f}: ${this.getFieldValue(knowledge, f) || '未填写'}`)
          .join('\n');
        context += `\n\n相关字段信息:\n${relatedInfo}`;
      }
    }

    return context;
  }

  /**
   * 获取字段当前值
   */
  private getFieldValue(knowledge: any, field: string): any {
    if (!knowledge) return null;

    // 字段可能在嵌套对象中
    const parts = field.split('.');
    let value = knowledge;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  /**
   * 获取相关字段
   */
  private getRelatedFields(field: string): string[] {
    const relations: Record<string, string[]> = {
      coreBizIntro: ['companyName', 'industry', 'targetCustomer'],
      targetCustomer: ['coreBizIntro', 'productService'],
      productService: ['coreBizIntro', 'targetCustomer', 'differentialAdvantage'],
      differentialAdvantage: ['competitorMarket', 'targetCustomer'],
    };

    return relations[field] || [];
  }

  /**
   * 解析 AI 响应
   */
  private parseAiResponse(content: string, field: string): {
    suggestion: string;
    confidence: number;
    tips: string[];
    examples: string[];
  } {
    // 尝试解析 JSON
    const parsed = this.parseJsonResponse(content);

    if (parsed.suggestion) {
      return {
        suggestion: parsed.suggestion,
        confidence: parsed.confidence || 0.85,
        tips: parsed.tips || [],
        examples: parsed.examples || this.FIELD_PROMPTS[field]?.examples || [],
      };
    }

    // 降级处理：直接返回文本内容
    return {
      suggestion: content.trim(),
      confidence: 0.7,
      tips: [],
      examples: this.FIELD_PROMPTS[field]?.examples || [],
    };
  }

  /**
   * 解析 JSON 响应
   */
  private parseJsonResponse(content: string): any {
    try {
      // 尝试提取 JSON 代码块
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }

      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  /**
   * 获取降级建议
   */
  private getFallbackSuggestion(field: string): {
    suggestion: string;
    confidence: number;
    tips: string[];
    examples: string[];
  } {
    const fallbacks: Record<string, { suggestion: string; tips: string[] }> = {
      companyName: {
        suggestion: '建议使用简短、有辨识度的公司名称，便于AI识别和SEO优化',
        tips: ['避免过长名称', '包含核心业务关键词', '易于记忆和传播'],
      },
      industry: {
        suggestion: '请选择最接近您业务的行业分类',
        tips: ['参考行业标准分类', '选择一级分类', '可覆盖多个行业'],
      },
      coreBizIntro: {
        suggestion: '用一句话概括您的核心业务，突出差异化价值',
        tips: ['控制在50字以内', '包含核心关键词', '突出独特卖点'],
      },
      targetCustomer: {
        suggestion: '越具体越好，精准的目标客户画像有助于AI生成更合适的策略',
        tips: ['包含客户类型(ToB/ToC)', '包含规模或年龄段', '包含行业或职业'],
      },
    };

    const fallback = fallbacks[field] || {
      suggestion: '请填写相关信息，AI将基于此生成更精准的诊断和策略',
      tips: ['尽量填写完整', '使用具体描述', '包含关键信息'],
    };

    return {
      ...fallback,
      confidence: 0.6,
      examples: this.FIELD_PROMPTS[field]?.examples || [],
    };
  }

  /**
   * 分析各个模块
   */
  private analyzeSections(knowledge: BrandKnowledgeBase): {
    key: string;
    name: string;
    score: number;
    suggestions: string[];
  }[] {
    const modules = [
      { key: 'basicInfo', name: '企业基础信息', critical: true },
      { key: 'bizPositioning', name: '核心业务与定位', critical: true },
      { key: 'productService', name: '产品与服务详情', critical: true },
      { key: 'competitorMarket', name: '竞品与市场信息', critical: false },
      { key: 'geoGoals', name: 'GEO推广目标', critical: false },
      { key: 'supplement', name: '补充信息', critical: false },
    ];

    return modules.map((m) => {
      const data = (knowledge as any)[m.key];
      const { score, missing } = this.calculateSectionScore(data, m.key);

      const suggestions: string[] = [];
      if (score < 0.5) {
        suggestions.push(`建议完善${m.name}信息`);
      }
      if (missing.length > 0) {
        suggestions.push(`建议补充: ${missing.slice(0, 3).join(', ')}`);
      }

      return {
        key: m.key,
        name: m.name,
        score,
        suggestions,
      };
    });
  }

  /**
   * 计算模块得分
   */
  private calculateSectionScore(data: any, section: string): {
    score: number;
    missing: string[];
  } {
    if (!data) {
      return { score: 0, missing: ['所有字段'] };
    }

    const fieldRequirements: Record<string, string[]> = {
      basicInfo: ['companyName', 'industry', 'companyShortName'],
      bizPositioning: ['coreBizIntro', 'targetCustomer', 'differentialAdvantage'],
      productService: ['productServiceList', 'productSellPoint'],
      competitorMarket: ['competitors'],
      geoGoals: ['promotionGoals', 'keyPromotionArea'],
      supplement: [],
    };

    const required = fieldRequirements[section] || [];
    if (required.length === 0) {
      return { score: data ? 1 : 0, missing: [] };
    }

    const filled = required.filter((field) => {
      const value = data[field];
      return value && (typeof value !== 'object' || Object.keys(value).length > 0);
    });

    const missing = required.filter((field) => {
      const value = data[field];
      return !value || (typeof value === 'object' && Object.keys(value).length === 0);
    });

    return {
      score: filled.length / required.length,
      missing,
    };
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendations(
    sections: { key: string; name: string; score: number; suggestions: string[] }[],
  ): string[] {
    const recommendations: string[] = [];

    // 优先补充低分模块
    const sorted = [...sections].sort((a, b) => a.score - b.score);
    const lowest = sorted[0];

    if (lowest.score < 0.5) {
      recommendations.push(`优先完善「${lowest.name}」，这是影响AI诊断准确度的关键因素`);
    }

    // 检查关键信息
    const criticalLow = sections
      .filter((s) => ['basicInfo', 'bizPositioning', 'productService'].includes(s.key) && s.score < 0.7);

    if (criticalLow.length > 0) {
      recommendations.push('关键信息完整度不足，建议优先补充后再进行诊断');
    }

    // SEO 建议
    const geoGoalsSection = sections.find((s) => s.key === 'geoGoals');
    if (geoGoalsSection && geoGoalsSection.score < 0.5) {
      recommendations.push('建议明确GEO推广目标，以便AI生成更精准的优化策略');
    }

    // 通用建议
    if (recommendations.length === 0) {
      recommendations.push('知识库信息较为完整，可以进行GEO诊断');
    }

    return recommendations;
  }

  /**
   * 构建关键词上下文
   */
  private buildKeywordContext(knowledge: BrandKnowledgeBase): string {
    const parts: string[] = [];

    if (knowledge.basicInfo) {
      parts.push(`公司名称: ${knowledge.basicInfo.companyName || '未填写'}`);
      parts.push(`行业: ${knowledge.basicInfo.industry || '未填写'}`);
    }

    if (knowledge.bizPositioning) {
      parts.push(`核心业务: ${knowledge.bizPositioning.coreBizIntro || '未填写'}`);
      parts.push(`目标客户: ${knowledge.bizPositioning.targetCustomer || '未填写'}`);
    }

    if (knowledge.productService?.coreKeywords?.length && knowledge.productService.coreKeywords.length > 0) {
      parts.push(`产品关键词: ${knowledge.productService.coreKeywords.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * 获取降级关键词建议
   */
  private getFallbackKeywords(knowledge: BrandKnowledgeBase): {
    primary: string[];
    secondary: string[];
    longTail: string[];
    competition: 'high' | 'medium' | 'low';
  } {
    const keywords: string[] = [];

    if (knowledge.basicInfo?.companyShortName) {
      keywords.push(knowledge.basicInfo.companyShortName);
    }

    if (knowledge.basicInfo?.industry) {
      keywords.push(knowledge.basicInfo.industry);
    }

    if (knowledge.bizPositioning?.coreBizIntro) {
      keywords.push(...knowledge.bizPositioning.coreBizIntro.split(' ').slice(0, 3));
    }

    if (knowledge.productService?.coreKeywords && Array.isArray(knowledge.productService.coreKeywords)) {
      keywords.push(...knowledge.productService.coreKeywords.slice(0, 5));
    }

    return {
      primary: keywords.slice(0, 3),
      secondary: keywords.slice(3, 6),
      longTail: keywords.slice(0, 5).map((k) => `${k}怎么做`),
      competition: 'medium',
    };
  }

  /**
   * 获取当前字段值（用于对比）
   */
  private getCurrentFieldValues(knowledge: any, fields: string[]): Record<string, string> {
    const result: Record<string, string> = {};

    for (const field of fields) {
      const value = this.getFieldValue(knowledge, field);
      result[field] = value ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : '未填写';
    }

    return result;
  }
}
