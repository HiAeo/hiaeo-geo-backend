import { Injectable } from '@nestjs/common';
import { EngineManager } from '../../ai/adapters/engine-manager';
import { BrandDiagnosisResult } from '../../ai/interfaces/ai-engine.interface';
import { AiService } from '../../ai/services/ai.service';

export interface CompetitorComparison {
  competitorName: string;
  overallScore?: number;
  dimensionScores?: any[];
  strengths: string[];
  weaknesses: string[];
  gap: number;
}

export interface CompetitorAnalysisResult {
  selfBrand: string;
  competitors: CompetitorComparison[];
  positioningMap: {
    x: number;
    y: number;
    label: string;
    type: 'self' | 'competitor';
  }[];
  marketGaps: string[];
  recommendations: string[];
}

@Injectable()
export class CompetitorAnalyzerService {
  constructor(
    private engineManager: EngineManager,
    private aiService: AiService,
  ) {}

  async analyzeCompetitors(
    brandName: string,
    competitors: string[],
    engine?: string
  ): Promise<CompetitorAnalysisResult> {
    const selfDiagnosis = await this.engineManager.diagnoseBrand({ brandName }, engine);
    const competitorDiagnoses: Array<{ name: string; diagnosis: BrandDiagnosisResult }> = [];

    for (const competitor of competitors) {
      try {
        const diagnosis = await this.engineManager.diagnoseBrand({ brandName: competitor }, engine);
        competitorDiagnoses.push({ name: competitor, diagnosis });
      } catch (error) {
        console.error(`竞品 ${competitor} 诊断失败:`, error.message);
      }
    }

    const competitorComparisons: CompetitorComparison[] = competitorDiagnoses.map(({ name, diagnosis }) => ({
      competitorName: name,
      overallScore: (diagnosis as any).overallScore,
      dimensionScores: (diagnosis as any).dimensionScores,
      strengths: diagnosis.competitiveAdvantages,
      weaknesses: diagnosis.potentialIssues,
      gap: 0,
    }));

    const selfScore = (selfDiagnosis as any).overallScore || 70;
    for (const comp of competitorComparisons) {
      comp.gap = selfScore - (comp.overallScore || 70);
    }

    const positioningMap = [
      { x: selfScore, y: 70, label: brandName, type: 'self' as const },
      ...competitorComparisons.map(comp => ({
        x: comp.overallScore || 70,
        y: 65 + Math.random() * 20,
        label: comp.competitorName,
        type: 'competitor' as const
      }))
    ];

    const marketGaps = this.identifyMarketGaps(selfDiagnosis, competitorDiagnoses.map(c => c.diagnosis));
    const recommendations = this.generateRecommendations(selfDiagnosis, competitorComparisons);

    return {
      selfBrand: brandName,
      competitors: competitorComparisons,
      positioningMap,
      marketGaps,
      recommendations,
    };
  }

  private identifyMarketGaps(selfDiagnosis: BrandDiagnosisResult, competitorDiagnoses: BrandDiagnosisResult[]): string[] {
    const gaps: string[] = [];
    const selfIssues = selfDiagnosis.potentialIssues;

    for (const competitor of competitorDiagnoses) {
      const competitorAdvantages = competitor.competitiveAdvantages;
      for (const issue of selfIssues) {
        if (!competitorAdvantages.some(adv => adv.includes(issue))) {
          gaps.push(`市场空白: ${issue} - 竞品未覆盖`);
        }
      }
    }

    return [...new Set(gaps)].slice(0, 5);
  }

  private generateRecommendations(selfDiagnosis: BrandDiagnosisResult, competitors: CompetitorComparison[]): string[] {
    const recommendations: string[] = [];

    if (selfDiagnosis.contentSuggestions.length > 0) {
      recommendations.push(...selfDiagnosis.contentSuggestions.slice(0, 3));
    }

    const strongestCompetitor = competitors.reduce((max, c) => c.gap > max.gap ? c : max, competitors[0]);
    if (strongestCompetitor) {
      recommendations.push(`参考竞品 ${strongestCompetitor.competitorName} 的成功策略`);
    }

    const avgScore = competitors.reduce((sum, c) => sum + (c.overallScore || 70), 0) / competitors.length;
    if (selfDiagnosis.confidence < 0.8) {
      recommendations.push('提升GEO诊断置信度，加强数据收集');
    }

    return recommendations;
  }

  async identifyCompetitorsFromMarket(text: string): Promise<string[]> {
    const response = await this.aiService.chat(
      {
        messages: [
          { role: 'system', content: '你是一个市场分析专家，请从文本中识别主要竞品。' },
          { role: 'user', content: `从以下文本中识别出主要竞品品牌，JSON格式返回：{"competitors": ["竞品1", "竞品2", ...]}\n\n${text}` }
        ]
      }
    );
    return this.extractCompetitorsFromText(response.message.content);
  }

  private extractCompetitorsFromText(text: string): string[] {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.competitors || [];
      }
    } catch {}
    return [];
  }
}
