import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../brand/entities/brand.entity';
import { EngineManager } from '../../ai/adapters/engine-manager';
import { AiService } from '../../ai/services/ai.service';
import { IntelligenceService } from '../../intelligence/intelligence.service';

export interface CompetitorAutoDiscoveryResult {
  discovered: CompetitorInfo[];
  marketShare?: Record<string, number>;
  opportunities: string[];
  threats: string[];
}

export interface CompetitorInfo {
  name: string;
  website?: string;
  score?: number;
  strengths: string[];
  weaknesses: string[];
  lastAnalyzed?: string;
  trackingSince?: string;
}

export interface CompetitorTrackingRecord {
  competitorName: string;
  scoreHistory: { date: string; score: number }[];
  strategyChanges: { date: string; change: string }[];
  suppressionScore: number;
}

/**
 * 竞品自动化追踪服务
 * 智能发现竞品、持续追踪、自动生成压制策略
 */
@Injectable()
export class CompetitorAutoTrackService {
  private readonly logger = new Logger(CompetitorAutoTrackService.name);

  // 竞品追踪数据（生产环境应使用数据库）
  private trackingRecords: Map<string, CompetitorTrackingRecord[]> = new Map();
  private competitorCache: Map<string, CompetitorInfo> = new Map();

  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    private engineManager: EngineManager,
    private aiService: AiService,
    private intelligenceService: IntelligenceService,
  ) {}

  /**
   * 自动发现竞品
   * 基于品牌信息和市场分析智能识别竞品
   */
  async autoDiscoverCompetitors(
    brandName: string,
    industry?: string,
    existingCompetitors: string[] = [],
  ): Promise<CompetitorAutoDiscoveryResult> {
    this.logger.log(`自动发现竞品 - 品牌: ${brandName}`);

    const discovered: CompetitorInfo[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // 1. 使用AI从行业知识中发现竞品
    const aiCompetitors = await this.discoverFromAI(brandName, industry);
    discovered.push(...aiCompetitors);

    // 2. 验证并补充竞品网站信息
    for (const comp of discovered) {
      if (comp.website) {
        try {
          const websiteData = await this.intelligenceService.fetchWebsite(comp.website);
          // 验证网站确实与竞品相关
          if (this.isRelatedWebsite(brandName, comp.name, websiteData.mainContent)) {
            comp.weaknesses = this.inferWeaknesses(websiteData);
            comp.strengths = this.inferStrengths(websiteData);
          }
        } catch (error) {
          this.logger.warn(`竞品网站验证失败: ${comp.website}`);
        }
      }
    }

    // 3. 分析市场机会
    opportunities.push(...this.identifyOpportunities(discovered));

    // 4. 识别威胁
    threats.push(...this.identifyThreats(discovered));

    // 5. 过滤已存在的竞品
    const newCompetitors = discovered.filter(
      (c) => !existingCompetitors.includes(c.name),
    );

    return {
      discovered: newCompetitors,
      opportunities,
      threats,
    };
  }

  /**
   * 持续追踪竞品
   */
  async trackCompetitor(
    brandName: string,
    competitorName: string,
    interval: 'daily' | 'weekly' | 'monthly' = 'weekly',
  ): Promise<CompetitorTrackingRecord | null> {
    this.logger.log(`追踪竞品: ${competitorName}`);

    // 1. 获取当前诊断数据
    const currentDiagnosis = await this.engineManager.diagnoseBrand(
      { brandName: competitorName },
      'deepseek',
    );

    const currentScore = (currentDiagnosis as any).overallScore || 70;

    // 2. 获取历史追踪记录
    const brandKey = brandName.toLowerCase().replace(/\s+/g, '_');
    let records = this.trackingRecords.get(brandKey) || [];

    const existingRecord = records.find((r) => r.competitorName === competitorName);

    if (existingRecord) {
      // 更新历史记录
      existingRecord.scoreHistory.push({
        date: new Date().toISOString(),
        score: currentScore,
      });

      // 保持最多12条历史记录
      if (existingRecord.scoreHistory.length > 12) {
        existingRecord.scoreHistory = existingRecord.scoreHistory.slice(-12);
      }

      // 检测策略变化
      if (existingRecord.scoreHistory.length >= 2) {
        const latest = existingRecord.scoreHistory[existingRecord.scoreHistory.length - 1];
        const previous = existingRecord.scoreHistory[existingRecord.scoreHistory.length - 2];
        const change = latest.score - previous.score;

        if (Math.abs(change) > 5) {
          existingRecord.strategyChanges.push({
            date: new Date().toISOString(),
            change: `评分${change > 0 ? '上升' : '下降'} ${Math.abs(change)} 分`,
          });
        }
      }

      // 更新压制分数
      existingRecord.suppressionScore = await this.calculateSuppressionScore(
        brandName,
        competitorName,
      );

      records = records.map((r) =>
        r.competitorName === competitorName ? existingRecord : r,
      );
    } else {
      // 创建新记录
      const newRecord: CompetitorTrackingRecord = {
        competitorName,
        scoreHistory: [{ date: new Date().toISOString(), score: currentScore }],
        strategyChanges: [],
        suppressionScore: 0,
      };
      newRecord.suppressionScore = await this.calculateSuppressionScore(
        brandName,
        competitorName,
      );
      records.push(newRecord);
    }

    this.trackingRecords.set(brandKey, records);

    return records.find((r) => r.competitorName === competitorName) || null;
  }

  /**
   * 生成竞品压制策略
   */
  async generateSuppressionStrategy(
    brandName: string,
    competitorName: string,
  ): Promise<{
    strategy: string;
    keywords: string[];
    actions: { action: string; priority: string; effort: string }[];
    expectedEffect: string;
  }> {
    this.logger.log(`生成压制策略 - 目标: ${competitorName}`);

    // 1. 获取自身和竞品数据
    const selfDiagnosis = await this.engineManager.diagnoseBrand(
      { brandName },
      'deepseek',
    );
    const competitorDiagnosis = await this.engineManager.diagnoseBrand(
      { brandName: competitorName },
      'deepseek',
    );

    const selfStrengths = selfDiagnosis.competitiveAdvantages || [];
    const competitorWeaknesses = competitorDiagnosis.potentialIssues || [];
    const competitorStrengths = competitorDiagnosis.competitiveAdvantages || [];

    // 2. 分析竞品关键词策略
    const competitorKeywords = this.extractKeywords(competitorDiagnosis);

    // 3. 生成压制策略
    const strategyPrompt = `
作为GEO优化专家，为品牌"${brandName}"生成针对竞品"${competitorName}"的压制策略。

竞品优势: ${competitorStrengths.join(', ') || '未知'}
竞品弱点: ${competitorWeaknesses.join(', ') || '未知'}
竞品关键词: ${competitorKeywords.join(', ') || '未知'}

请输出JSON格式的策略:
{
  "strategy": "策略概述",
  "keywords": ["关键词1", "关键词2"],
  "actions": [{"action": "行动描述", "priority": "high/medium/low", "effort": "预估工作量"}],
  "expectedEffect": "预期效果"
}
`;

    try {
      const response = await this.aiService.chat({
        messages: [
          { role: 'system', content: '你是一个GEO优化专家，擅长竞品分析和压制策略制定。' },
          { role: 'user', content: strategyPrompt },
        ],
      });

      return this.parseStrategyResponse(response.message.content);
    } catch (error) {
      this.logger.warn(`AI策略生成失败，使用备用方案: ${error.message}`);
      return this.generateFallbackStrategy(brandName, competitorName);
    }
  }

  /**
   * 获取竞品对比报告
   */
  async getComparisonReport(
    brandName: string,
    competitors: string[],
  ): Promise<{
    selfBrand: string;
    competitors: CompetitorInfo[];
    comparisonMatrix: {
      dimension: string;
      selfScore: number;
      competitorScores: Record<string, number>;
    }[];
    recommendations: string[];
  }> {
    this.logger.log(`生成竞品对比报告 - 品牌: ${brandName}, 竞品: ${competitors.join(', ')}`);

    // 1. 获取自身诊断
    const selfDiagnosis = await this.engineManager.diagnoseBrand(
      { brandName },
      'deepseek',
    );

    // 2. 获取所有竞品诊断
    const competitorDiagnoses = await Promise.all(
      competitors.map(async (comp) => {
        try {
          const diagnosis = await this.engineManager.diagnoseBrand(
            { brandName: comp },
            'deepseek',
          );
          return { name: comp, diagnosis };
        } catch (error) {
          this.logger.warn(`竞品 ${comp} 诊断失败`);
          return { name: comp, diagnosis: null };
        }
      }),
    );

    // 3. 构建对比矩阵
    const dimensions = [
      { name: '品牌识别', key: 'brandPositioning' },
      { name: '内容覆盖', key: 'contentSuggestions' },
      { name: '竞争优势', key: 'competitiveAdvantages' },
      { name: '市场机会', key: 'marketOpportunities' },
    ];

    const comparisonMatrix = dimensions.map((dim) => {
      const selfScore = this.calculateDimensionScore(selfDiagnosis, dim.key);
      const competitorScores: Record<string, number> = {};

      for (const { name, diagnosis } of competitorDiagnoses) {
        if (diagnosis) {
          competitorScores[name] = this.calculateDimensionScore(diagnosis, dim.key);
        }
      }

      return {
        dimension: dim.name,
        selfScore,
        competitorScores,
      };
    });

    // 4. 生成建议
    const recommendations = this.generateComparisonRecommendations(
      brandName,
      selfDiagnosis,
      competitorDiagnoses,
    );

    return {
      selfBrand: brandName,
      competitors: competitorDiagnoses.map(({ name, diagnosis }) => ({
        name,
        score: (diagnosis as any)?.overallScore || 0,
        strengths: diagnosis?.competitiveAdvantages || [],
        weaknesses: diagnosis?.potentialIssues || [],
        lastAnalyzed: new Date().toISOString(),
      })),
      comparisonMatrix,
      recommendations,
    };
  }

  /**
   * 获取竞品追踪历史
   */
  async getTrackingHistory(
    brandName: string,
    competitorName?: string,
  ): Promise<CompetitorTrackingRecord[]> {
    const brandKey = brandName.toLowerCase().replace(/\s+/g, '_');
    const records = this.trackingRecords.get(brandKey) || [];

    if (competitorName) {
      return records.filter((r) => r.competitorName === competitorName);
    }

    return records;
  }

  // ==================== 私有方法 ====================

  /**
   * 从AI发现竞品
   */
  private async discoverFromAI(
    brandName: string,
    industry?: string,
  ): Promise<CompetitorInfo[]> {
    try {
      const prompt = `
识别"${brandName}"（${industry || '相关行业'}）的主要竞争对手。

请以JSON格式输出最多5个主要竞品:
{
  "competitors": [
    {"name": "竞品1名称", "website": "竞品官网"},
    {"name": "竞品2名称", "website": "竞品官网"}
  ]
}
`;

      const response = await this.aiService.chat({
        messages: [
          { role: 'system', content: '你是一个市场分析专家，擅长识别竞争对手。' },
          { role: 'user', content: prompt },
        ],
      });

      return this.parseCompetitorsFromResponse(response.message.content);
    } catch (error) {
      this.logger.warn(`AI竞品发现失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 解析竞品响应
   */
  private parseCompetitorsFromResponse(content: string): CompetitorInfo[] {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        return (data.competitors || []).map((c: any) => ({
          name: c.name,
          website: c.website,
          strengths: [],
          weaknesses: [],
          discovered: true,
        }));
      }
    } catch (error) {
      this.logger.warn(`竞品响应解析失败: ${error.message}`);
    }
    return [];
  }

  /**
   * 检查网站是否与竞品相关
   */
  private isRelatedWebsite(
    brandName: string,
    competitorName: string,
    content: string,
  ): boolean {
    const lowerContent = content.toLowerCase();
    const lowerBrand = brandName.toLowerCase();
    const lowerComp = competitorName.toLowerCase();

    // 检查内容中是否提到品牌或竞品名称
    return (
      lowerContent.includes(lowerComp) ||
      lowerContent.includes(lowerBrand) ||
      this.hasIndustryIndicators(lowerContent)
    );
  }

  /**
   * 检查是否有行业特征
   */
  private hasIndustryIndicators(content: string): boolean {
    const industryKeywords = [
      '产品', '服务', '解决方案', '公司', 'about', 'product', 'service',
      'solution', 'company', 'contact', '联系我们', 'products',
    ];
    return industryKeywords.some((kw) => content.includes(kw));
  }

  /**
   * 推断竞品弱点
   */
  private inferWeaknesses(websiteData: any): string[] {
    const weaknesses: string[] = [];

    if (!websiteData.description || websiteData.description.length < 50) {
      weaknesses.push('网站描述不够详细');
    }

    if (!websiteData.contacts?.phone && !websiteData.contacts?.email) {
      weaknesses.push('联系方式不完整');
    }

    if (websiteData.h1.length === 0) {
      weaknesses.push('缺少主标题');
    }

    if (websiteData.mainContent.length < 500) {
      weaknesses.push('内容较少');
    }

    return weaknesses;
  }

  /**
   * 推断竞品优势
   */
  private inferStrengths(websiteData: any): string[] {
    const strengths: string[] = [];

    if (websiteData.description && websiteData.description.length > 100) {
      strengths.push('网站描述详细');
    }

    if (websiteData.h1.length > 0) {
      strengths.push('标题结构清晰');
    }

    if (websiteData.social && Object.keys(websiteData.social).length > 0) {
      strengths.push('社交媒体布局完善');
    }

    if (websiteData.contacts?.phone && websiteData.contacts?.email) {
      strengths.push('联系方式完善');
    }

    return strengths;
  }

  /**
   * 识别市场机会
   */
  private identifyOpportunities(competitors: CompetitorInfo[]): string[] {
    const opportunities: string[] = [];

    // 分析竞品弱点发现机会
    const allWeaknesses = competitors.flatMap((c) => c.weaknesses);
    const weaknessCounts = this.countOccurrences(allWeaknesses);

    for (const [weakness, count] of Object.entries(weaknessCounts)) {
      if (count <= 2) {
        // 只有少数竞品有这个弱点
        opportunities.push(`竞品普遍存在"${weakness}"问题，可作为差异化切入点`);
      }
    }

    return opportunities;
  }

  /**
   * 识别威胁
   */
  private identifyThreats(competitors: CompetitorInfo[]): string[] {
    const threats: string[] = [];

    // 分析竞品优势发现威胁
    const strongCompetitors = competitors.filter(
      (c) => c.strengths.length >= 3,
    );

    if (strongCompetitors.length > 2) {
      threats.push(`市场存在${strongCompetitors.length}个强劲竞争对手`);
    }

    return threats;
  }

  /**
   * 计算压制分数
   */
  private async calculateSuppressionScore(
    brandName: string,
    competitorName: string,
  ): Promise<number> {
    try {
      const selfDiagnosis = await this.engineManager.diagnoseBrand(
        { brandName },
        'deepseek',
      );
      const competitorDiagnosis = await this.engineManager.diagnoseBrand(
        { brandName: competitorName },
        'deepseek',
      );

      const selfScore = (selfDiagnosis as any).overallScore || 70;
      const competitorScore = (competitorDiagnosis as any).overallScore || 70;

      // 压制分数 = 自身优势分差 + 优势项加成 - 劣势项扣分
      const selfAdvantages = selfDiagnosis.competitiveAdvantages?.length || 0;
      const competitorAdvantages = competitorDiagnosis.competitiveAdvantages?.length || 0;
      const selfIssues = selfDiagnosis.potentialIssues?.length || 0;
      const competitorIssues = competitorDiagnosis.potentialIssues?.length || 0;

      const suppressionScore = Math.min(
        100,
        Math.max(
          0,
          50 +
            (selfScore - competitorScore) +
            selfAdvantages * 3 -
            selfIssues * 2 +
            competitorIssues * 2 -
            competitorAdvantages * 2,
        ),
      );

      return Math.round(suppressionScore);
    } catch (error) {
      return 50;
    }
  }

  /**
   * 提取关键词
   */
  private extractKeywords(diagnosis: any): string[] {
    const keywords: string[] = [];

    if (diagnosis.competitiveAdvantages) {
      keywords.push(...diagnosis.competitiveAdvantages.slice(0, 5));
    }
    if (diagnosis.marketOpportunities) {
      keywords.push(...diagnosis.marketOpportunities.slice(0, 5));
    }
    if (diagnosis.contentSuggestions) {
      keywords.push(...diagnosis.contentSuggestions.slice(0, 5));
    }

    return [...new Set(keywords)];
  }

  /**
   * 解析策略响应
   */
  private parseStrategyResponse(content: string): any {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (error) {
      this.logger.warn(`策略响应解析失败`);
    }
    return this.generateFallbackStrategy('', '');
  }

  /**
   * 生成备用策略
   */
  private generateFallbackStrategy(
    brandName: string,
    competitorName: string,
  ): any {
    return {
      strategy: `针对${competitorName}的内容压制策略`,
      keywords: [`${brandName}优势`, '差异化对比'],
      actions: [
        { action: '发布对比内容', priority: 'high', effort: '1-2天' },
        { action: '优化相关关键词布局', priority: 'medium', effort: '1天' },
      ],
      expectedEffect: '提升品牌竞争力',
    };
  }

  /**
   * 计算维度分数
   */
  private calculateDimensionScore(diagnosis: any, key: string): number {
    if (!diagnosis) return 50;

    switch (key) {
      case 'brandPositioning':
        return diagnosis.brandPositioning ? 80 : 50;
      case 'contentSuggestions':
        return Math.min(100, 50 + (diagnosis.contentSuggestions?.length || 0) * 5);
      case 'competitiveAdvantages':
        return Math.min(100, 50 + (diagnosis.competitiveAdvantages?.length || 0) * 8);
      case 'marketOpportunities':
        return Math.min(100, 50 + (diagnosis.marketOpportunities?.length || 0) * 6);
      default:
        return 60;
    }
  }

  /**
   * 生成对比建议
   */
  private generateComparisonRecommendations(
    brandName: string,
    selfDiagnosis: any,
    competitorDiagnoses: { name: string; diagnosis: any }[],
  ): string[] {
    const recommendations: string[] = [];

    // 找出最大差距
    const selfAdvantages = selfDiagnosis.competitiveAdvantages?.length || 0;

    for (const { name, diagnosis } of competitorDiagnoses) {
      if (diagnosis) {
        const compAdvantages = diagnosis.competitiveAdvantages?.length || 0;
        if (compAdvantages > selfAdvantages + 2) {
          recommendations.push(
            `竞品${name}竞争优势明显，建议学习其${diagnosis.competitiveAdvantages?.[0] || '成功策略'}`,
          );
        }
      }
    }

    // 自身优势建议
    if (selfAdvantages > 3) {
      recommendations.push(
        `品牌已有${selfAdvantages}项竞争优势，建议加强宣传扩大优势`,
      );
    }

    return recommendations;
  }

  /**
   * 统计出现次数
   */
  private countOccurrences(items: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item] = (counts[item] || 0) + 1;
    }
    return counts;
  }
}
