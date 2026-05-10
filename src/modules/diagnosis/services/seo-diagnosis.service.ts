import { Injectable, Logger } from '@nestjs/common';
import { WebScraperService, WebScrapeResult, WebPageData } from './web-scraper.service';
import { DiagnosisTask } from '../entities/diagnosis-task.entity';

export interface SEODiagnosisResult {
  seoScore: {
    technical: number;
    content: number;
    authority: number;
    performance: number;
    overall: number;
  };
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  aiSearchPresence: {
    score: number;
    detected: boolean;
    types: string[];
  };
  summary: string;
  rawData?: WebPageData;
}

export interface SEOIssue {
  category: 'technical' | 'content' | 'authority' | 'performance';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  affectedElement?: string;
  estimatedImpact?: number;
}

export interface SEORecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: string;
}

@Injectable()
export class SEODiagnosisService {
  private readonly logger = new Logger(SEODiagnosisService.name);

  constructor(private webScraper: WebScraperService) {}

  /**
   * 对网站进行全面SEO诊断
   */
  async diagnose(task: DiagnosisTask): Promise<SEODiagnosisResult> {
    const { website, brandName, industry, config } = task;

    if (!website) {
      return this.generateEmptyResult();
    }

    this.logger.log(`开始SEO诊断: ${website}`);

    // 爬取网站数据
    const scrapeResult = await this.webScraper.scrapeWebsite(website);

    if (!scrapeResult.success || !scrapeResult.data) {
      this.logger.warn(`网站爬取失败: ${scrapeResult.error}`);
      return this.generateErrorResult(scrapeResult.error);
    }

    const pageData = scrapeResult.data;
    const baseScore = scrapeResult.score;

    // 分析问题
    const issues: SEOIssue[] = this.analyzeIssues(pageData);

    // 生成建议
    const recommendations = this.generateRecommendations(pageData, issues);

    // 计算综合SEO分数
    const seoScore = this.calculateSEOScore(pageData, issues, baseScore);

    // 检测AI搜索表现
    const aiSearchPresence = this.detectAISearchPresence(pageData, issues);

    // 生成摘要
    const summary = this.generateSummary(pageData, seoScore, issues);

    this.logger.log(`SEO诊断完成: ${website}, 总体分: ${seoScore.overall}`);

    return {
      seoScore,
      issues,
      recommendations,
      aiSearchPresence,
      summary,
      rawData: pageData,
    };
  }

  /**
   * 分析页面SEO问题
   */
  private analyzeIssues(pageData: WebPageData): SEOIssue[] {
    const issues: SEOIssue[] = [];

    // 技术SEO问题
    if (!pageData.title) {
      issues.push({
        category: 'technical',
        severity: 'high',
        title: '缺少页面标题',
        description: '页面缺少<title>标签，这对搜索引擎理解页面内容至关重要。',
        recommendation: '添加描述性的<title>标签，建议格式：页面标题 - 网站名称。',
        estimatedImpact: 15,
      });
    } else if (pageData.title.length < 10) {
      issues.push({
        category: 'technical',
        severity: 'medium',
        title: '页面标题过短',
        description: `页面标题 "${pageData.title}" 长度不足，可能影响搜索展示效果。`,
        recommendation: '建议标题长度为30-60个字符。',
        estimatedImpact: 8,
      });
    } else if (pageData.title.length > 70) {
      issues.push({
        category: 'technical',
        severity: 'low',
        title: '页面标题过长',
        description: `页面标题超过70字符，可能在搜索结果中被截断。`,
        recommendation: '建议将标题控制在60个字符以内。',
        estimatedImpact: 5,
      });
    }

    if (!pageData.description) {
      issues.push({
        category: 'content',
        severity: 'high',
        title: '缺少Meta描述',
        description: '页面缺少meta description标签，影响搜索结果中的摘要显示。',
        recommendation: '添加120-160字符的meta描述，包含关键词和行动号召。',
        estimatedImpact: 12,
      });
    } else if (pageData.description.length < 50) {
      issues.push({
        category: 'content',
        severity: 'medium',
        title: 'Meta描述过短',
        description: `Meta描述 "${pageData.description}" 长度不足。`,
        recommendation: '建议meta描述长度为120-160字符。',
        estimatedImpact: 7,
      });
    }

    if (pageData.h1.length === 0) {
      issues.push({
        category: 'content',
        severity: 'high',
        title: '缺少H1标题',
        description: '页面缺少H1标签，搜索引擎无法确认页面主题。',
        recommendation: '添加一个包含核心关键词的H1标签。',
        estimatedImpact: 10,
      });
    } else if (pageData.h1.length > 1) {
      issues.push({
        category: 'content',
        severity: 'medium',
        title: 'H1标签过多',
        description: `页面包含${pageData.h1.length}个H1标签，建议每个页面只使用一个。`,
        recommendation: '保留最重要的H1，其余改为H2或H3。',
        estimatedImpact: 6,
      });
    }

    if (!pageData.lang) {
      issues.push({
        category: 'technical',
        severity: 'medium',
        title: '缺少语言声明',
        description: 'HTML标签缺少lang属性，影响搜索引擎语言识别。',
        recommendation: '在<html>标签中添加lang属性，如lang="zh-CN"。',
        estimatedImpact: 5,
      });
    }

    if (!pageData.canonical) {
      issues.push({
        category: 'technical',
        severity: 'low',
        title: '缺少Canonical标签',
        description: '页面缺少canonical标签，可能导致重复内容问题。',
        recommendation: '添加canonical标签指向规范URL。',
        estimatedImpact: 4,
      });
    }

    if (pageData.imagesWithoutAlt > 0) {
      issues.push({
        category: 'content',
        severity: 'medium',
        title: '图片缺少Alt属性',
        description: `${pageData.imagesWithoutAlt}个图片缺少alt属性，影响图片搜索和可访问性。`,
        recommendation: '为所有图片添加描述性的alt属性。',
        estimatedImpact: 8,
      });
    }

    // 内容问题
    if (pageData.wordCount < 300) {
      issues.push({
        category: 'content',
        severity: 'medium',
        title: '页面内容过少',
        description: `页面仅包含${pageData.wordCount}个字，内容可能不够丰富。`,
        recommendation: '建议页面内容至少包含300字以上的原创内容。',
        estimatedImpact: 7,
      });
    }

    if (pageData.keywords.length === 0) {
      issues.push({
        category: 'content',
        severity: 'low',
        title: '缺少Meta关键词',
        description: '页面缺少meta keywords标签。',
        recommendation: '添加与页面内容相关的关键词（虽然权重降低，但仍有一定作用）。',
        estimatedImpact: 3,
      });
    }

    // 权威性问题
    if (pageData.linksCount.external === 0) {
      issues.push({
        category: 'authority',
        severity: 'low',
        title: '缺少外部链接',
        description: '页面没有指向外部网站的链接。',
        recommendation: '适当添加指向权威网站的外部链接可提升页面可信度。',
        estimatedImpact: 3,
      });
    }

    if (pageData.schemaOrg.length === 0) {
      issues.push({
        category: 'technical',
        severity: 'medium',
        title: '缺少结构化数据',
        description: '页面没有Schema.org结构化数据，影响富媒体搜索结果展示。',
        recommendation: '添加适当的Schema.org标记，如Organization、Article或Product。',
        estimatedImpact: 10,
      });
    }

    // 性能问题
    const criticalScripts = pageData.scripts.filter(s => !s.isAsync && !s.isDeferred).length;
    if (criticalScripts > 3) {
      issues.push({
        category: 'performance',
        severity: 'high',
        title: '阻塞渲染的脚本过多',
        description: `页面有${criticalScripts}个阻塞渲染的脚本，影响页面加载速度。`,
        recommendation: '将非关键脚本设置为async或defer，或移至页面底部。',
        estimatedImpact: 12,
      });
    }

    // AI搜索检测
    if (!pageData.openGraph['title']) {
      issues.push({
        category: 'content',
        severity: 'low',
        title: '缺少Open Graph标签',
        description: '页面缺少社交分享所需的OG标签。',
        recommendation: '添加og:title、og:description、og:image等标签以优化社交分享效果。',
        estimatedImpact: 4,
      });
    }

    return issues;
  }

  /**
   * 生成SEO建议
   */
  private generateRecommendations(pageData: WebPageData, issues: SEOIssue[]): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];

    // 基于问题的建议
    const highPriorityIssues = issues.filter(i => i.severity === 'high');
    const mediumPriorityIssues = issues.filter(i => i.severity === 'medium');

    highPriorityIssues.forEach(issue => {
      recommendations.push({
        category: issue.category,
        title: `修复：${issue.title}`,
        description: issue.recommendation,
        priority: 'high',
        effort: this.estimateEffort(issue.category),
        impact: `预计提升${issue.estimatedImpact || 5}分`,
      });
    });

    mediumPriorityIssues.forEach(issue => {
      recommendations.push({
        category: issue.category,
        title: `优化：${issue.title}`,
        description: issue.recommendation,
        priority: 'medium',
        effort: this.estimateEffort(issue.category),
        impact: `预计提升${issue.estimatedImpact || 3}分`,
      });
    });

    // 额外的优化建议
    if (pageData.openGraph['title']) {
      recommendations.push({
        category: 'social',
        title: '增强社交分享效果',
        description: '添加Twitter Card标签以优化Twitter分享效果。',
        priority: 'low',
        effort: 'low',
        impact: '提升社交媒体流量',
      });
    }

    if (pageData.schemaOrg.length > 0) {
      recommendations.push({
        category: 'technical',
        title: '验证结构化数据',
        description: '使用Google结构化数据测试工具验证Schema.org标记的正确性。',
        priority: 'low',
        effort: 'low',
        impact: '确保富媒体搜索展示',
      });
    }

    return recommendations;
  }

  /**
   * 计算SEO分数
   */
  private calculateSEOScore(
    pageData: WebPageData,
    issues: SEOIssue[],
    baseScore: { technical: number; content: number; performance: number }
  ): { technical: number; content: number; authority: number; performance: number; overall: number } {
    // 基础分数（基于爬取结果）
    const technical = baseScore.technical;
    const content = baseScore.content;
    const performance = baseScore.performance;
    
    // 根据问题扣分
    const issueDeduction = issues.reduce((sum: number, issue: SEOIssue) => {
      switch (issue.severity) {
        case 'high': return sum + 8;
        case 'medium': return sum + 4;
        case 'low': return sum + 2;
        default: return sum;
      }
    }, 0);

    // 权威性分数
    let authority = 50;
    authority += Math.min(20, pageData.linksCount.external * 2);
    authority += pageData.schemaOrg.length > 0 ? 15 : 0;
    authority += pageData.openGraph['title'] ? 10 : 0;
    authority = Math.min(100, Math.max(0, authority));

    // 综合分数
    const overall = Math.max(0, Math.min(100,
      (technical * 0.25) +
      (content * 0.25) +
      (authority * 0.25) +
      (performance * 0.25) -
      issueDeduction
    ));

    return {
      technical: Math.max(0, technical - issueDeduction / 2),
      content: Math.max(0, content - issueDeduction / 2),
      authority,
      performance,
      overall: Math.round(overall),
    };
  }

  /**
   * 检测AI搜索表现
   */
  private detectAISearchPresence(pageData: WebPageData, issues: SEOIssue[]): {
    score: number;
    detected: boolean;
    types: string[];
  } {
    const types: string[] = [];
    let score = 30; // 基础分数

    // 检查是否被AI搜索引擎索引
    if (pageData.schemaOrg.length > 0) {
      types.push('Structured Data');
      score += 15;
    }

    if (pageData.openGraph['title']) {
      types.push('Social Cards');
      score += 10;
    }

    if (pageData.twitter['card']) {
      types.push('Twitter Cards');
      score += 10;
    }

    if (pageData.bodyText.length > 500) {
      types.push('Rich Content');
      score += 15;
    }

    if (pageData.h1.length > 0 && pageData.keywords.length > 0) {
      types.push('Semantic Keywords');
      score += 10;
    }

    // 检查AI友好的技术要素
    const hasSemanticTags = pageData.schemaOrg.some(schema => 
      schema['@type'] === 'Article' || 
      schema['@type'] === 'NewsArticle' ||
      schema['@type'] === 'BlogPosting'
    );
    
    if (hasSemanticTags) {
      types.push('AI-Optimized Articles');
      score += 10;
    }

    return {
      score: Math.min(100, score),
      detected: score > 50,
      types: [...new Set(types)],
    };
  }

  /**
   * 生成摘要
   */
  private generateSummary(pageData: WebPageData, seoScore: any, issues: SEOIssue[]): string {
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    
    let summary = `网站 ${pageData.url} 的SEO综合评分为${seoScore.overall}分。`;

    if (highIssues > 0) {
      summary += ` 发现${highIssues}个高优先级问题需要立即修复，`;
    }
    
    if (mediumIssues > 0) {
      summary += ` ${mediumIssues}个中优先级问题建议优化，`;
    }

    if (highIssues === 0 && mediumIssues === 0) {
      summary += ' 网站SEO基础良好，';
    }

    summary += `技术SEO得分${seoScore.technical}分，内容质量得分${seoScore.content}分，`;
    summary += `权威性得分${seoScore.authority}分，性能得分${seoScore.performance}分。`;

    return summary;
  }

  /**
   * 生成空结果
   */
  private generateEmptyResult(): SEODiagnosisResult {
    return {
      seoScore: { technical: 0, content: 0, authority: 0, performance: 0, overall: 0 },
      issues: [],
      recommendations: [],
      aiSearchPresence: { score: 0, detected: false, types: [] },
      summary: '未提供网站URL，无法进行SEO诊断。',
    };
  }

  /**
   * 生成错误结果
   */
  private generateErrorResult(error?: string): SEODiagnosisResult {
    return {
      seoScore: { technical: 0, content: 0, authority: 0, performance: 0, overall: 0 },
      issues: [{
        category: 'technical',
        severity: 'high',
        title: '网站无法访问',
        description: error || '无法爬取网站内容，请检查URL是否正确或网站是否可访问。',
        recommendation: '请确认网站URL正确且可访问。',
        estimatedImpact: 100,
      }],
      recommendations: [{
        category: 'technical',
        title: '检查网站可访问性',
        description: '确保网站URL正确且服务器可响应。',
        priority: 'high',
        effort: 'low',
        impact: '诊断前提',
      }],
      aiSearchPresence: { score: 0, detected: false, types: [] },
      summary: `网站爬取失败：${error || '未知错误'}`,
    };
  }

  /**
   * 估算修复工作量
   */
  private estimateEffort(category: string): 'low' | 'medium' | 'high' {
    switch (category) {
      case 'technical': return 'medium';
      case 'content': return 'medium';
      case 'authority': return 'high';
      case 'performance': return 'medium';
      default: return 'medium';
    }
  }
}
