import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../../knowledge/entities/brand-knowledge-base.entity';
import { GenerateMofaStrategyDto, StrategyType } from '../dto/mofa-strategy.dto';

/**
 * 知识库感知策略服务
 * 从知识库获取上下文信息，用于生成更精准的策略
 */
@Injectable()
export class KnowledgeAwareStrategyService {
  private readonly logger = new Logger(KnowledgeAwareStrategyService.name);

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
  ) {}

  /**
   * 获取知识库上下文用于策略生成
   */
  async getKnowledgeContextForStrategy(
    organizationId: string,
  ): Promise<{
    brandName: string;
    productDescription: string;
    targetAudience: string;
    industry: string;
    keywords: string[];
    competitors: string[];
    brandStrengths: string;
    brandChallenges: string;
    geoTarget: string;
    forbiddenWords: string[];
  } | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      this.logger.warn(`未找到知识库: ${organizationId}`);
      return null;
    }

    // 构建策略上下文
    const context = {
      brandName: this.getBrandName(knowledge),
      productDescription: this.getProductDescription(knowledge),
      targetAudience: this.getTargetAudience(knowledge),
      industry: knowledge.basicInfo?.industry || '',
      keywords: this.getKeywords(knowledge),
      competitors: this.getCompetitors(knowledge),
      brandStrengths: this.getBrandStrengths(knowledge),
      brandChallenges: this.getBrandChallenges(knowledge),
      geoTarget: this.getGeoTarget(knowledge),
      forbiddenWords: this.getForbiddenWords(knowledge),
    };

    this.logger.log(`策略上下文已构建 - org: ${organizationId}, brand: ${context.brandName}`);

    return context;
  }

  /**
   * 从知识库上下文生成策略
   */
  async generateStrategyFromKnowledge(
    organizationId: string,
    strategyType: StrategyType,
  ): Promise<{
    success: boolean;
    data?: GenerateMofaStrategyDto;
    error?: string;
  }> {
    const context = await this.getKnowledgeContextForStrategy(organizationId);

    if (!context) {
      return { success: false, error: '未找到知识库，请先完善品牌知识库' };
    }

    if (!context.productDescription) {
      return { success: false, error: '知识库缺少产品/服务描述，请先完善产品服务详情' };
    }

    const strategyDto: GenerateMofaStrategyDto = {
      brandName: context.brandName,
      productDescription: context.productDescription,
      targetAudience: context.targetAudience,
      industry: context.industry,
      keywords: context.keywords,
      competitors: context.competitors.join(', '),
      brandStrengths: context.brandStrengths,
      brandChallenges: context.brandChallenges,
      strategyType,
      planningWeeks: 12,
      targetPlatforms: this.getTargetPlatformsFromGoals(organizationId),
    };

    return { success: true, data: strategyDto };
  }

  /**
   * 验证策略与知识库的一致性
   */
  async validateStrategyConsistency(
    organizationId: string,
    strategy: any,
  ): Promise<{
    valid: boolean;
    warnings: string[];
    suggestions: string[];
  }> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return {
        valid: false,
        warnings: ['未找到关联的知识库'],
        suggestions: ['请先创建品牌知识库'],
      };
    }

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查关键词一致性
    const knowledgeKeywords = this.getKeywords(knowledge);
    if (strategy.keywords) {
      const missingKeywords = knowledgeKeywords.filter(
        (k: string) => !strategy.keywords.includes(k),
      );
      if (missingKeywords.length > 0) {
        suggestions.push(`建议将以下知识库关键词纳入策略: ${missingKeywords.join(', ')}`);
      }
    }

    // 检查竞品一致性
    const knowledgeCompetitors = this.getCompetitors(knowledge);
    if (strategy.competitors) {
      const missingCompetitors = knowledgeCompetitors.filter(
        (c: string) => !strategy.competitors.includes(c),
      );
      if (missingCompetitors.length > 0) {
        warnings.push(`知识库中存在但策略未分析的竞品: ${missingCompetitors.join(', ')}`);
      }
    }

    // 检查目标受众一致性
    const knowledgeAudience = this.getTargetAudience(knowledge);
    if (strategy.targetAudience && knowledgeAudience) {
      if (!strategy.targetAudience.includes(knowledgeAudience.substring(0, 10))) {
        suggestions.push('策略中的目标受众与知识库定义可能不一致，建议统一');
      }
    }

    // 检查禁忌词
    const forbiddenWords = this.getForbiddenWords(knowledge);
    if (strategy.content && forbiddenWords.length > 0) {
      const usedForbidden = forbiddenWords.filter((w) =>
        JSON.stringify(strategy.content).includes(w),
      );
      if (usedForbidden.length > 0) {
        warnings.push(`策略内容可能包含禁忌词: ${usedForbidden.join(', ')}`);
      }
    }

    return {
      valid: warnings.length === 0,
      warnings,
      suggestions,
    };
  }

  /**
   * 基于诊断报告优化策略建议
   */
  async getStrategyRecommendationsFromDiagnosis(
    organizationId: string,
    diagnosisReport: any,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (!diagnosisReport) {
      return recommendations;
    }

    // 从诊断问题中提取策略建议
    if (diagnosisReport.issues && Array.isArray(diagnosisReport.issues)) {
      diagnosisReport.issues.forEach((issue: any) => {
        if (issue.severity === 'high' || issue.severity === 'critical') {
          recommendations.push(`优先解决: ${issue.title}`);
        }
      });
    }

    // 从诊断建议中提取策略方向
    if (diagnosisReport.suggestions && Array.isArray(diagnosisReport.suggestions)) {
      diagnosisReport.suggestions.forEach((suggestion: any, index: number) => {
        if (index < 5) {
          recommendations.push(`策略建议: ${suggestion.content || suggestion}`);
        }
      });
    }

    // 从维度得分中提取优化方向
    if (diagnosisReport.dimensionScores) {
      const lowScoreDimensions = Object.entries(diagnosisReport.dimensionScores)
        .filter(([_, score]) => (score as number) < 0.6)
        .map(([dimension]) => dimension);

      if (lowScoreDimensions.length > 0) {
        recommendations.push(`重点优化维度: ${lowScoreDimensions.join(', ')}`);
      }
    }

    return recommendations;
  }

  // ==================== 私有辅助方法 ====================

  private getBrandName(knowledge: BrandKnowledgeBase): string {
    return (
      knowledge.basicInfo?.companyShortName ||
      knowledge.basicInfo?.companyName ||
      '未命名品牌'
    );
  }

  private getProductDescription(knowledge: BrandKnowledgeBase): string {
    const parts: string[] = [];

    if (knowledge.bizPositioning?.coreBizIntro) {
      parts.push(knowledge.bizPositioning.coreBizIntro);
    }

    if (knowledge.productService?.productSellPoint) {
      parts.push(knowledge.productService.productSellPoint);
    }

    if (knowledge.productService?.productServiceList && knowledge.productService.productServiceList.length > 0) {
      const products = knowledge.productService.productServiceList
        .map((p: any) => p.productName)
        .join('、');
      parts.push(`主要产品/服务: ${products}`);
    }

    return parts.join('; ');
  }

  private getTargetAudience(knowledge: BrandKnowledgeBase): string {
    return knowledge.bizPositioning?.targetCustomer || '';
  }

  private getKeywords(knowledge: BrandKnowledgeBase): string[] {
    const keywords: string[] = [];

    if (knowledge.productService?.coreKeywords) {
      keywords.push(...knowledge.productService.coreKeywords);
    }

    if (knowledge.basicInfo?.companyShortName) {
      keywords.push(knowledge.basicInfo.companyShortName);
    }

    if (knowledge.basicInfo?.industry) {
      keywords.push(knowledge.basicInfo.industry);
    }

    return [...new Set(keywords)].slice(0, 10);
  }

  private getCompetitors(knowledge: BrandKnowledgeBase): string[] {
    if (!knowledge.competitorMarket?.competitors) {
      return [];
    }

    return knowledge.competitorMarket.competitors
      .map((c: any) => c.competitorName)
      .filter(Boolean);
  }

  private getBrandStrengths(knowledge: BrandKnowledgeBase): string {
    return (
      knowledge.bizPositioning?.differentialAdvantage ||
      '待补充品牌优势'
    );
  }

  private getBrandChallenges(knowledge: BrandKnowledgeBase): string {
    const challenges: string[] = [];

    if (knowledge.bizPositioning?.customerPainPoint) {
      challenges.push(`客户痛点: ${knowledge.bizPositioning.customerPainPoint}`);
    }

    if (knowledge.competitorMarket?.marketGap) {
      challenges.push(`市场空白: ${knowledge.competitorMarket.marketGap}`);
    }

    return challenges.join('; ') || '待分析品牌挑战';
  }

  private getGeoTarget(knowledge: BrandKnowledgeBase): string {
    const parts: string[] = [];

    if (knowledge.geoGoals?.keyPromotionArea) {
      parts.push(knowledge.geoGoals.keyPromotionArea);
    }

    if (knowledge.geoGoals?.promotionGoals) {
      parts.push(`推广目标: ${knowledge.geoGoals.promotionGoals.join(', ')}`);
    }

    return parts.join('; ');
  }

  private getForbiddenWords(knowledge: BrandKnowledgeBase): string[] {
    const words: string[] = [];

    // 品牌禁忌词
    if (knowledge.supplement?.brandForbiddenWords) {
      words.push(
        ...knowledge.supplement.brandForbiddenWords
          .split(/[,，]/)
          .filter(Boolean),
      );
    }

    // 禁止推广业务
    if (knowledge.bizPositioning?.forbiddenBiz) {
      // 简单处理，可能包含禁忌表述
      const forbiddenMatches = knowledge.bizPositioning.forbiddenBiz.match(
        /[^\s,，]+/g,
      );
      if (forbiddenMatches) {
        words.push(...forbiddenMatches);
      }
    }

    return [...new Set(words)];
  }

  private getTargetPlatformsFromGoals(organizationId: string): any[] {
    // 根据推广目标推断目标平台
    // 这里暂时返回空数组，让前端根据实际情况选择
    return [];
  }
}
