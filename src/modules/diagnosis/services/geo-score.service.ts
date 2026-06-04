import { Injectable, Logger } from '@nestjs/common';
import { EngineManager } from '../../ai/adapters/engine-manager';
import { BrandDiagnosisResult } from '../../ai/interfaces/ai-engine.interface';

export interface GEOScoreResult {
  // 7维度分数
  D1_brandEntityScore: number;      // D1 品牌实体识别准确率
  D2_productRelevanceScore: number; // D2 产品关联度
  D3_sentimentPositiveScore: number; // D3 正面情感占比
  D4_competitorSuppressionScore: number; // D4 竞品压制指数
  D5_contentCoverageScore: number;   // D5 内容覆盖度
  D6_websiteTrafficScore: number;    // D6 官网引流率
  D7_updateActivityScore: number;   // D7 更新活跃度
  // 综合分数
  overallScore: number;
  // 维度详情
  dimensionDetails: {
    name: string;
    score: number;
    weight: number;
    analysis: string;
  }[];
}

@Injectable()
export class GEOScoreService {
  private readonly logger = new Logger(GEOScoreService.name);

  // 维度权重配置
  private readonly weights = {
    D1: 0.15,  // 品牌实体识别
    D2: 0.15,  // 产品关联度
    D3: 0.10,  // 正面情感
    D4: 0.15,  // 竞品压制
    D5: 0.15,  // 内容覆盖度
    D6: 0.15,  // 官网引流率
    D7: 0.15,  // 更新活跃度
  };

  constructor(private engineManager: EngineManager) {}

  /**
   * 计算GEO 7维度完整分数
   */
  async calculateGEOScore(params: {
    brandName: string;
    website?: string;
    competitors?: string[];
    engine?: string;
  }): Promise<GEOScoreResult> {
    const { brandName, website, competitors = [], engine = 'deepseek' } = params;

    this.logger.log(`开始计算GEO 7维度分数 - 品牌: ${brandName}`);

    // 并行执行各项分析以提高效率
    const [brandDiagnosis, competitorAnalysis] = await Promise.all([
      this.analyzeBrandDiagnosis(brandName, engine),
      this.analyzeCompetitorSuppression(brandName, competitors, engine),
    ]);

    // 计算各项维度分数
    const geoScores: GEOScoreResult = {
      D1_brandEntityScore: brandDiagnosis.D1,
      D2_productRelevanceScore: brandDiagnosis.D2,
      D3_sentimentPositiveScore: brandDiagnosis.D3,
      D4_competitorSuppressionScore: competitorAnalysis.suppressionScore,
      D5_contentCoverageScore: brandDiagnosis.D5,
      D6_websiteTrafficScore: brandDiagnosis.D6,
      D7_updateActivityScore: brandDiagnosis.D7,
      overallScore: 0,
      dimensionDetails: [],
    };

    // 计算加权总分
    geoScores.overallScore = Math.round(
      geoScores.D1_brandEntityScore * this.weights.D1 +
      geoScores.D2_productRelevanceScore * this.weights.D2 +
      geoScores.D3_sentimentPositiveScore * this.weights.D3 +
      geoScores.D4_competitorSuppressionScore * this.weights.D4 +
      geoScores.D5_contentCoverageScore * this.weights.D5 +
      geoScores.D6_websiteTrafficScore * this.weights.D6 +
      geoScores.D7_updateActivityScore * this.weights.D7
    );

    // 生成维度详情
    geoScores.dimensionDetails = [
      { name: 'D1_品牌实体识别准确率', score: geoScores.D1_brandEntityScore, weight: this.weights.D1, analysis: brandDiagnosis.D1Analysis },
      { name: 'D2_产品关联度', score: geoScores.D2_productRelevanceScore, weight: this.weights.D2, analysis: brandDiagnosis.D2Analysis },
      { name: 'D3_正面情感占比', score: geoScores.D3_sentimentPositiveScore, weight: this.weights.D3, analysis: brandDiagnosis.D3Analysis },
      { name: 'D4_竞品压制指数', score: geoScores.D4_competitorSuppressionScore, weight: this.weights.D4, analysis: competitorAnalysis.analysis },
      { name: 'D5_内容覆盖度', score: geoScores.D5_contentCoverageScore, weight: this.weights.D5, analysis: brandDiagnosis.D5Analysis },
      { name: 'D6_官网引流率', score: geoScores.D6_websiteTrafficScore, weight: this.weights.D6, analysis: brandDiagnosis.D6Analysis },
      { name: 'D7_更新活跃度', score: geoScores.D7_updateActivityScore, weight: this.weights.D7, analysis: brandDiagnosis.D7Analysis },
    ];

    this.logger.log(`GEO分数计算完成 - 品牌: ${brandName}, 综合分: ${geoScores.overallScore}`);

    return geoScores;
  }

  /**
   * 分析品牌诊断（计算D1, D2, D3, D5, D6, D7）
   */
  private async analyzeBrandDiagnosis(brandName: string, engine: string): Promise<{
    D1: number;
    D1Analysis: string;
    D2: number;
    D2Analysis: string;
    D3: number;
    D3Analysis: string;
    D5: number;
    D5Analysis: string;
    D6: number;
    D6Analysis: string;
    D7: number;
    D7Analysis: string;
  }> {
    try {
      const diagnosis: BrandDiagnosisResult = await this.engineManager.diagnoseBrand(
        { brandName },
        engine
      );

      // D1 品牌实体识别准确率
      // 基于品牌定位清晰度、品牌信息一致性
      const D1 = this.calculateD1Score(diagnosis);

      // D2 产品关联度
      // 基于产品描述完整性、关键词覆盖
      const D2 = this.calculateD2Score(diagnosis);

      // D3 正面情感占比
      // 基于竞品对比中的优势数量、问题数量
      const D3 = this.calculateD3Score(diagnosis);

      // D5 内容覆盖度
      // 基于内容建议数量、市场机会
      const D5 = this.calculateD5Score(diagnosis);

      // D6 官网引流率
      // 基于品牌权威性、链接建设情况
      const D6 = this.calculateD6Score(diagnosis);

      // D7 更新活跃度
      // 基于置信度、市场动态响应
      const D7 = this.calculateD7Score(diagnosis);

      return {
        D1,
        D1Analysis: `品牌实体识别能力: ${D1}分 - ${diagnosis.brandPositioning || '品牌定位已建立'}`,
        D2,
        D2Analysis: `产品关联度: ${D2}分 - 建议: ${diagnosis.contentSuggestions?.[0] || '持续优化产品信息'}`,
        D3,
        D3Analysis: `正面情感占比: ${D3}分 - 竞争优势: ${diagnosis.competitiveAdvantages?.length || 0}项`,
        D5,
        D5Analysis: `内容覆盖广度: ${D5}分 - 市场机会: ${diagnosis.marketOpportunities?.length || 0}项`,
        D6,
        D6Analysis: `官网引流能力: ${D6}分 - 置信度: ${Math.round((diagnosis.confidence || 0.7) * 100)}%`,
        D7,
        D7Analysis: `内容更新活跃度: ${D7}分 - ${diagnosis.potentialIssues?.length || 0}个待优化项`,
      };
    } catch (error) {
      this.logger.warn(`品牌诊断分析失败: ${error.message}, 使用默认分数`);
      return this.getDefaultScores();
    }
  }

  /**
   * 分析竞品压制指数 (D4)
   */
  private async analyzeCompetitorSuppression(
    brandName: string,
    competitors: string[],
    engine: string
  ): Promise<{ suppressionScore: number; analysis: string }> {
    if (competitors.length === 0) {
      // 无竞品数据时，基于品牌自身优势评估
      return {
        suppressionScore: 65, // 基准分
        analysis: '暂无竞品对比数据，建议添加竞品以获得更准确的压制指数',
      };
    }

    try {
      const diagnosis = await this.engineManager.diagnoseBrand({ brandName }, engine);
      const selfAdvantages = diagnosis.competitiveAdvantages?.length || 0;
      const selfIssues = diagnosis.potentialIssues?.length || 0;

      // 诊断竞品
      let competitorTotalScore = 0;
      let competitorCount = 0;

      for (const competitor of competitors) {
        try {
          const competitorDiagnosis = await this.engineManager.diagnoseBrand(
            { brandName: competitor },
            engine
          );
          const competitorScore = (competitorDiagnosis as any).overallScore || 70;
          competitorTotalScore += competitorScore;
          competitorCount++;
        } catch {
          this.logger.warn(`竞品 ${competitor} 诊断失败`);
        }
      }

      const avgCompetitorScore = competitorCount > 0 ? competitorTotalScore / competitorCount : 70;
      const selfScore = (diagnosis as any).overallScore || 70;

      // 计算压制指数
      // 公式: 基础分50 + (自身优势分 - 竞品均分) + 优势数量加成
      const advantageDiff = selfScore - avgCompetitorScore;
      const suppressionScore = Math.min(100, Math.max(0,
        50 + advantageDiff + selfAdvantages * 3 - selfIssues * 2
      ));

      let analysis: string;
      if (suppressionScore >= 80) {
        analysis = `品牌压制能力强，相比竞品有明显优势`;
      } else if (suppressionScore >= 60) {
        analysis = `品牌与竞品处于竞争态势，需加强差异化`;
      } else {
        analysis = `品牌相比竞品处于劣势，建议加强竞争优势建设`;
      }

      return {
        suppressionScore: Math.round(suppressionScore),
        analysis: `${analysis} (自身: ${Math.round(selfScore)} vs 竞品均分: ${Math.round(avgCompetitorScore)})`,
      };
    } catch (error) {
      this.logger.warn(`竞品压制分析失败: ${error.message}`);
      return {
        suppressionScore: 50,
        analysis: '竞品分析暂时不可用',
      };
    }
  }

  /**
   * D1 品牌实体识别准确率
   */
  private calculateD1Score(diagnosis: BrandDiagnosisResult): number {
    // 基于品牌定位清晰度、品牌信息一致性、品牌认知度
    let score = 60; // 基础分

    if (diagnosis.brandPositioning) {
      score += 15; // 有品牌定位
    }

    if (diagnosis.competitiveAdvantages?.length > 0) {
      score += 10; // 有竞争优势描述
    }

    if (diagnosis.confidence > 0.8) {
      score += 15; // 高置信度
    } else if (diagnosis.confidence > 0.6) {
      score += 8;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * D2 产品关联度
   */
  private calculateD2Score(diagnosis: BrandDiagnosisResult): number {
    let score = 55; // 基础分

    // 内容建议越多，说明产品关联内容越丰富
    const suggestionCount = diagnosis.contentSuggestions?.length || 0;
    score += Math.min(25, suggestionCount * 5);

    // 竞争优势越多，产品关联度越强
    const advantageCount = diagnosis.competitiveAdvantages?.length || 0;
    score += Math.min(15, advantageCount * 3);

    return Math.min(100, Math.round(score));
  }

  /**
   * D3 正面情感占比
   */
  private calculateD3Score(diagnosis: BrandDiagnosisResult): number {
    let score = 65; // 基础分

    // 竞争优势越多，正面情感越多
    const advantageCount = diagnosis.competitiveAdvantages?.length || 0;
    score += advantageCount * 5;

    // 问题越少，正面情感越多
    const issueCount = diagnosis.potentialIssues?.length || 0;
    score -= issueCount * 3;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * D5 内容覆盖度
   */
  private calculateD5Score(diagnosis: BrandDiagnosisResult): number {
    let score = 50; // 基础分

    // 市场机会越多，内容覆盖越广
    const opportunityCount = diagnosis.marketOpportunities?.length || 0;
    score += opportunityCount * 8;

    // 内容建议越多，覆盖越全面
    const suggestionCount = diagnosis.contentSuggestions?.length || 0;
    score += suggestionCount * 5;

    return Math.min(100, Math.round(score));
  }

  /**
   * D6 官网引流率
   */
  private calculateD6Score(diagnosis: BrandDiagnosisResult): number {
    let score = 50; // 基础分

    // 置信度反映官网数据的完整性
    const confidence = diagnosis.confidence || 0.7;
    score += confidence * 30;

    // 竞争优势越多，官网吸引力越强
    const advantageCount = diagnosis.competitiveAdvantages?.length || 0;
    score += advantageCount * 4;

    return Math.min(100, Math.round(score));
  }

  /**
   * D7 更新活跃度
   */
  private calculateD7Score(diagnosis: BrandDiagnosisResult): number {
    let score = 60; // 基础分

    // 市场机会多说明对市场动态响应好
    const opportunityCount = diagnosis.marketOpportunities?.length || 0;
    score += opportunityCount * 5;

    // 问题多说明需要更新
    const issueCount = diagnosis.potentialIssues?.length || 0;
    if (issueCount > 5) {
      score -= 10; // 问题多可能意味着内容陈旧
    }

    // 置信度高说明数据新鲜
    if (diagnosis.confidence > 0.8) {
      score += 10;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * 默认分数（分析失败时使用）
   */
  private getDefaultScores() {
    return {
      D1: 60,
      D1Analysis: '品牌诊断暂时不可用',
      D2: 55,
      D2Analysis: '产品关联分析暂时不可用',
      D3: 65,
      D3Analysis: '情感分析暂时不可用',
      D5: 50,
      D5Analysis: '内容覆盖分析暂时不可用',
      D6: 50,
      D6Analysis: '官网引流分析暂时不可用',
      D7: 60,
      D7Analysis: '更新活跃度分析暂时不可用',
    };
  }
}
