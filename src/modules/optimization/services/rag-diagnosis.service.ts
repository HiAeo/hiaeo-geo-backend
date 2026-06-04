import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../../knowledge/entities/brand-knowledge-base.entity';
import { EngineManager } from '../../ai/adapters/engine-manager';
import { AiService } from '../../ai/services/ai.service';
import { EmbeddingService } from '../../knowledge/services/embedding.service';
import { VectorStorageService } from '../../knowledge/services/vector-storage.service';

export interface RAGDiagnosisContext {
  knowledgeBaseId: string;
  brandContext: {
    name: string;
    positioning: string;
    products: string[];
    competitors: string[];
  };
  relevantDocuments: {
    id: string;
    content: string;
    source: string;
    relevance: number;
  }[];
  historicalDiagnoses: {
    date: string;
    score: number;
    keyFindings: string[];
  }[];
}

export interface RAGEnhancedDiagnosis {
  baseDiagnosis: any;
  ragContext: RAGDiagnosisContext;
  enhancedInsights: {
    knowledgeBasedSuggestions: string[];
    historicalPatterns: string[];
    improvementFromHistory: string[];
  };
  confidenceBoost: number;
}

/**
 * RAG增强诊断服务
 * 将知识库向量检索与诊断深度融合
 */
@Injectable()
export class RAGDiagnosisService {
  private readonly logger = new Logger(RAGDiagnosisService.name);

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private knowledgeRepository: Repository<BrandKnowledgeBase>,
    private engineManager: EngineManager,
    private aiService: AiService,
    private embeddingService: EmbeddingService,
    private vectorStorage: VectorStorageService,
  ) {}

  /**
   * 构建RAG诊断上下文
   */
  async buildRAGContext(
    brandId: string,
    diagnosisFocus?: string,
  ): Promise<RAGDiagnosisContext | null> {
    this.logger.log(`构建RAG诊断上下文 - brandId: ${brandId}`);

    // 1. 获取知识库基础数据
    const knowledgeBase = await this.knowledgeRepository.findOne({
      where: { organizationId: brandId },
    });

    if (!knowledgeBase) {
      this.logger.warn(`知识库不存在: ${brandId}`);
      return null;
    }

    // 2. 提取品牌上下文
    const brandContext = this.extractBrandContext(knowledgeBase);

    // 3. 向量检索相关文档
    const query = diagnosisFocus || `${brandContext.positioning} ${brandContext.products.join(' ')}`;
    const relevantDocs = await this.retrieveRelevantDocuments(brandId, query, 5);

    // 4. 获取历史诊断记录
    const historicalDiagnoses = await this.getHistoricalDiagnoses(brandId);

    return {
      knowledgeBaseId: knowledgeBase.id,
      brandContext,
      relevantDocuments: relevantDocs,
      historicalDiagnoses,
    };
  }

  /**
   * RAG增强诊断
   */
  async performRAGEnhancedDiagnosis(
    brandId: string,
    params: {
      brandName: string;
      website?: string;
      competitors?: string[];
      engine?: string;
    },
  ): Promise<RAGEnhancedDiagnosis> {
    this.logger.log(`执行RAG增强诊断 - brandId: ${brandId}`);

    // 1. 构建RAG上下文
    const ragContext = await this.buildRAGContext(
      brandId,
      `${params.brandName} ${params.website || ''}`,
    );

    // 2. 执行基础诊断
    const engine = params.engine || 'deepseek';
    let baseDiagnosis: any;

    if (params.website) {
      baseDiagnosis = await this.engineManager.diagnoseSEO(
        {
          targetUrl: params.website,
          targetName: params.brandName,
          targetIndustry: params.competitors?.[0],
          keywords: [],
        },
        engine,
      );
    } else {
      baseDiagnosis = await this.engineManager.diagnoseBrand(
        {
          brandName: params.brandName,
          productDescription: params.competitors?.[0],
          competitors: params.competitors || [],
        },
        engine,
      );
    }

    // 3. 使用RAG上下文增强诊断
    const enhancedInsights = await this.enhanceDiagnosisWithRAG(
      baseDiagnosis,
      ragContext,
    );

    // 4. 计算置信度提升
    const confidenceBoost = this.calculateConfidenceBoost(
      ragContext,
      enhancedInsights,
    );

    return {
      baseDiagnosis,
      ragContext: ragContext || {
        knowledgeBaseId: '',
        brandContext: { name: '', positioning: '', products: [], competitors: [] },
        relevantDocuments: [],
        historicalDiagnoses: [],
      },
      enhancedInsights,
      confidenceBoost,
    };
  }

  /**
   * 使用RAG上下文增强诊断结果
   */
  private async enhanceDiagnosisWithRAG(
    baseDiagnosis: any,
    ragContext: RAGDiagnosisContext | null,
  ): Promise<RAGEnhancedDiagnosis['enhancedInsights']> {
    const insights: RAGEnhancedDiagnosis['enhancedInsights'] = {
      knowledgeBasedSuggestions: [],
      historicalPatterns: [],
      improvementFromHistory: [],
    };

    if (!ragContext) {
      return insights;
    }

    // 1. 基于知识库生成建议
    insights.knowledgeBasedSuggestions = this.generateKnowledgeBasedSuggestions(
      baseDiagnosis,
      ragContext,
    );

    // 2. 分析历史模式
    insights.historicalPatterns = this.analyzeHistoricalPatterns(
      ragContext.historicalDiagnoses,
    );

    // 3. 基于历史提出改进建议
    insights.improvementFromHistory = this.generateImprovementFromHistory(
      baseDiagnosis,
      ragContext.historicalDiagnoses,
    );

    // 4. 使用AI深度整合
    if (ragContext.relevantDocuments.length > 0) {
      const aiEnhanced = await this.enhanceWithAI(
        baseDiagnosis,
        ragContext,
      );
      insights.knowledgeBasedSuggestions.push(...aiEnhanced);
    }

    return insights;
  }

  /**
   * 生成基于知识的建议
   */
  private generateKnowledgeBasedSuggestions(
    diagnosis: any,
    context: RAGDiagnosisContext,
  ): string[] {
    const suggestions: string[] = [];

    // 1. 对比知识库中的品牌定位
    const brandPositioning = context.brandContext.positioning;
    if (brandPositioning && diagnosis.brandPositioning) {
      if (brandPositioning !== diagnosis.brandPositioning) {
        suggestions.push(
          `建议同步更新品牌定位为: ${brandPositioning}`,
        );
      }
    }

    // 2. 检查产品覆盖
    const diagnosisProducts = this.extractProductsFromDiagnosis(diagnosis);
    const missingProducts = context.brandContext.products.filter(
      (p) => !diagnosisProducts.includes(p),
    );

    if (missingProducts.length > 0) {
      suggestions.push(
        `知识库中记录的产品[${missingProducts.join(', ')}]在诊断中未充分体现`,
      );
    }

    // 3. 检查竞品对比
    if (context.brandContext.competitors.length > 0) {
      const diagnosisCompetitors = diagnosis.potentialIssues?.length || 0;
      if (diagnosisCompetitors < context.brandContext.competitors.length) {
        suggestions.push(
          `建议加强与[${context.brandContext.competitors.slice(0, 3).join(', ')}]的竞品分析`,
        );
      }
    }

    return suggestions;
  }

  /**
   * 分析历史模式
   */
  private analyzeHistoricalPatterns(
    historicalDiagnoses: RAGDiagnosisContext['historicalDiagnoses'],
  ): string[] {
    const patterns: string[] = [];

    if (historicalDiagnoses.length < 2) {
      return ['历史数据不足，无法分析趋势'];
    }

    // 评分趋势分析
    const scores = historicalDiagnoses.map((d) => d.score);
    const latestScore = scores[scores.length - 1];
    const previousScore = scores[scores.length - 2];

    if (latestScore > previousScore) {
      patterns.push(`评分呈上升趋势（+${latestScore - previousScore}分）`);
    } else if (latestScore < previousScore) {
      patterns.push(`评分有所下降（${latestScore - previousScore}分），需关注`);
    } else {
      patterns.push('评分保持稳定');
    }

    // 周期性分析
    if (historicalDiagnoses.length >= 4) {
      const recentScores = scores.slice(-4);
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderScores = scores.slice(0, -4);
      if (olderScores.length > 0) {
        const avgOlder = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
        if (avgRecent > avgOlder) {
          patterns.push('近期表现优于早期，整体趋势向好');
        } else {
          patterns.push('早期表现较好，需保持优势');
        }
      }
    }

    // 问题频率分析
    const allFindings = historicalDiagnoses.flatMap((d) => d.keyFindings);
    const findingCounts = this.countOccurrences(allFindings);
    const frequentFindings = Object.entries(findingCounts)
      .filter(([_, count]) => count >= 2)
      .map(([finding]) => finding);

    if (frequentFindings.length > 0) {
      patterns.push(`反复出现的问题: ${frequentFindings.slice(0, 3).join(', ')}`);
    }

    return patterns;
  }

  /**
   * 基于历史生成改进建议
   */
  private generateImprovementFromHistory(
    diagnosis: any,
    historicalDiagnoses: RAGDiagnosisContext['historicalDiagnoses'],
  ): string[] {
    const suggestions: string[] = [];

    if (historicalDiagnoses.length === 0) {
      return suggestions;
    }

    // 找出历史上最好的诊断
    const bestDiagnosis = historicalDiagnoses.reduce(
      (best, current) => (current.score > best.score ? current : best),
      historicalDiagnoses[0],
    );

    // 对比当前与历史最佳
    const currentScore = (diagnosis as any).overallScore || 50;
    const scoreGap = bestDiagnosis.score - currentScore;

    if (scoreGap > 10) {
      suggestions.push(
        `当前评分(${currentScore}分)低于历史最佳(${bestDiagnosis.score}分)，建议参考历史最佳时的问题解决方案`,
      );

      // 提取历史最佳时的关键发现
      if (bestDiagnosis.keyFindings.length > 0) {
        suggestions.push(
          `历史最佳时的关键做法: ${bestDiagnosis.keyFindings[0]}`,
        );
      }
    }

    // 分析持续存在的问题
    const allFindings = historicalDiagnoses.flatMap((d) => d.keyFindings);
    const issueCounts = this.countOccurrences(allFindings);
    const persistentIssues = Object.entries(issueCounts)
      .filter(([_, count]) => count >= Math.ceil(historicalDiagnoses.length / 2))
      .map(([issue]) => issue);

    if (persistentIssues.length > 0) {
      suggestions.push(
        `⚠️ 持续存在的问题: ${persistentIssues[0]}，需要重点解决`,
      );
    }

    return suggestions;
  }

  /**
   * 使用AI深度增强
   */
  private async enhanceWithAI(
    diagnosis: any,
    context: RAGDiagnosisContext,
  ): Promise<string[]> {
    try {
      const contextSummary = context.relevantDocuments
        .map((d) => `[${d.source}]: ${d.content.substring(0, 200)}...`)
        .join('\n');

      const prompt = `
基于以下诊断结果和品牌知识库上下文，提供改进建议：

诊断结果:
- 品牌定位: ${diagnosis.brandPositioning || '未明确'}
- 竞争优势: ${(diagnosis.competitiveAdvantages || []).join(', ') || '无'}
- 潜在问题: ${(diagnosis.potentialIssues || []).join(', ') || '无'}

知识库上下文:
${contextSummary}

请提供3-5条针对性的改进建议，以JSON数组格式输出:
["建议1", "建议2", ...]
`;

      const response = await this.aiService.chat({
        messages: [
          {
            role: 'system',
            content: '你是品牌GEO优化专家，结合诊断结果和知识库提供精准建议。',
          },
          { role: 'user', content: prompt },
        ],
      });

      return this.parseSuggestions(response.message.content);
    } catch (error) {
      this.logger.warn(`AI增强失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 计算置信度提升
   */
  private calculateConfidenceBoost(
    context: RAGDiagnosisContext | null,
    insights: RAGEnhancedDiagnosis['enhancedInsights'],
  ): number {
    let boost = 0;

    if (!context) {
      return 0;
    }

    // 知识库完整度加分
    const completeness = this.calculateKnowledgeCompleteness(context.brandContext);
    boost += completeness * 0.2;

    // 历史数据加分
    if (context.historicalDiagnoses.length > 0) {
      boost += Math.min(0.15, context.historicalDiagnoses.length * 0.03);
    }

    // 相关文档加分
    if (context.relevantDocuments.length > 3) {
      boost += 0.1;
    }

    // 增强洞察加分
    const insightCount =
      insights.knowledgeBasedSuggestions.length +
      insights.historicalPatterns.length +
      insights.improvementFromHistory.length;
    boost += Math.min(0.15, insightCount * 0.02);

    return Math.round(boost * 100) / 100;
  }

  /**
   * 检索相关文档
   */
  private async retrieveRelevantDocuments(
    brandId: string,
    query: string,
    limit: number,
  ): Promise<RAGDiagnosisContext['relevantDocuments']> {
    try {
      // 使用语义搜索
      const searchResult = await this.vectorStorage.semanticSearch(
        brandId,
        query,
        limit,
      );

      return searchResult.results.map((result, index) => ({
        id: `doc-${index}`,
        content: result.text,
        source: result.section,
        relevance: result.similarity,
      }));
    } catch (error) {
      this.logger.warn(`文档检索失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取历史诊断
   */
  private async getHistoricalDiagnoses(
    brandId: string,
  ): Promise<RAGDiagnosisContext['historicalDiagnoses']> {
    // 这里应该查询历史诊断记录
    // 暂时返回空数组，生产环境应连接真实数据
    return [];
  }

  /**
   * 提取品牌上下文
   */
  private extractBrandContext(
    knowledgeBase: BrandKnowledgeBase,
  ): RAGDiagnosisContext['brandContext'] {
    const parseJSON = (str: any) => {
      if (typeof str === 'object') return str;
      if (typeof str === 'string') {
        try {
          return JSON.parse(str);
        } catch {
          return {};
        }
      }
      return {};
    };

    const basicInfo = parseJSON(knowledgeBase.basicInfo);
    const bizPositioning = parseJSON(knowledgeBase.bizPositioning);
    const productService = parseJSON(knowledgeBase.productService);
    const competitorMarket = parseJSON(knowledgeBase.competitorMarket);

    // 提取产品列表
    const products: string[] = [];
    if (productService.products) {
      if (Array.isArray(productService.products)) {
        products.push(...productService.products);
      } else if (typeof productService.products === 'object') {
        const values = Object.values(productService.products);
        for (const v of values) {
          if (Array.isArray(v)) {
            products.push(...v.map(String));
          } else if (typeof v === 'string') {
            products.push(v);
          }
        }
      }
    }

    // 提取竞品列表
    const competitors: string[] = [];
    if (competitorMarket.competitors) {
      if (Array.isArray(competitorMarket.competitors)) {
        competitors.push(
          ...competitorMarket.competitors.map(
            (c: any) => c.competitorName || c.name || c,
          ),
        );
      }
    }

    return {
      name: basicInfo.companyName || '未知品牌',
      positioning: bizPositioning.coreBizIntro || bizPositioning.corePositioning || '',
      products,
      competitors,
    };
  }

  /**
   * 从诊断中提取产品
   */
  private extractProductsFromDiagnosis(diagnosis: any): string[] {
    const products: string[] = [];

    if (diagnosis.contentSuggestions) {
      products.push(...diagnosis.contentSuggestions.slice(0, 5));
    }
    if (diagnosis.marketOpportunities) {
      products.push(...diagnosis.marketOpportunities.slice(0, 3));
    }

    return [...new Set(products)];
  }

  /**
   * 计算知识完整度
   */
  private calculateKnowledgeCompleteness(context: RAGDiagnosisContext['brandContext']): number {
    let filled = 0;
    let total = 4;

    if (context.name) filled++;
    if (context.positioning) filled++;
    if (context.products.length > 0) filled++;
    if (context.competitors.length > 0) filled++;

    return filled / total;
  }

  /**
   * 解析建议
   */
  private parseSuggestions(content: string): string[] {
    try {
      const match = content.match(/\[([\s\S]*)\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (error) {
      this.logger.warn(`建议解析失败`);
    }
    return [];
  }

  /**
   * 统计出现次数
   */
  private countOccurrences(items: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const normalized = item.toLowerCase().trim();
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
    return counts;
  }
}
