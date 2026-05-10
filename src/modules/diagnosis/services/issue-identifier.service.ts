import { Injectable } from '@nestjs/common';
import {
  IssueAnalysisResult,
  IdentifiedIssue,
} from '../interfaces/diagnosis.interface';

interface AIAnalysisResult {
  diagnosisId: string;
  brandName: string;
  overallScore: number;
  dimensionScores: {
    name: string;
    score: number;
    analysis: string;
    problems: string[];
  }[];
  suggestions: string[];
  issues: any[];
}

// 问题分类映射
const ISSUE_CATEGORIES: Record<string, string> = {
  '技术SEO基础': 'technical_seo',
  '内容质量与相关性': 'content_quality',
  '外部链接与权威性': 'link_building',
  '用户体验': 'user_experience',
  '地理定位优化': 'geo_optimization',
};

// 问题严重程度映射
const SEVERITY_SCORE_THRESHOLDS: Record<string, { critical: number; high: number; medium: number }> = {
  'technical_seo': { critical: 30, high: 50, medium: 65 },
  'content_quality': { critical: 25, high: 45, medium: 60 },
  'link_building': { critical: 20, high: 40, medium: 55 },
  'user_experience': { critical: 35, high: 55, medium: 70 },
  'geo_optimization': { critical: 30, high: 50, medium: 65 },
};

@Injectable()
export class IssueIdentifierService {
  /**
   * 识别问题
   */
  identify(
    aiResult: AIAnalysisResult,
    enginesUsed: string[],
  ): IssueAnalysisResult {
    const issues: IdentifiedIssue[] = [];

    // 1. 从AI诊断结果中提取问题
    const aiIssues = this.extractFromAIResult(aiResult);
    issues.push(...aiIssues);

    // 2. 基于维度评分识别潜在问题
    const potentialIssues = this.identifyPotentialIssues(aiResult);
    issues.push(...potentialIssues);

    // 3. 基于问题描述识别问题
    const describedIssues = this.identifyDescribedIssues(aiResult);
    issues.push(...describedIssues);

    // 4. 去重并排序
    const uniqueIssues = this.deduplicateAndSort(issues);

    // 5. 计算摘要
    const summary = this.calculateSummary(uniqueIssues);

    return {
      issues: uniqueIssues,
      summary,
    };
  }

  /**
   * 从AI诊断结果提取问题
   */
  private extractFromAIResult(result: AIAnalysisResult): IdentifiedIssue[] {
    const issues: IdentifiedIssue[] = [];
    
    for (const issue of (result.issues || [])) {
      const title = issue.title || issue.description || '未知问题';
      const severity = issue.severity || 'medium';
      
      issues.push({
        id: issue.id || `issue_ai_${issues.length + 1}`,
        category: this.categorizeIssue(title),
        title: title,
        description: issue.description || title,
        severity: this.normalizeSeverity(severity),
        impact: {
          dimension: this.inferAffectedDimension(issue),
          scoreImpact: this.estimateScoreImpact(severity),
          description: issue.impact || '',
        },
        affectedDimensions: [this.inferAffectedDimension(issue)],
        rootCause: issue.description || title,
        solution: issue.solution || '建议优化以改善此问题',
        estimatedEffort: this.estimateEffort(issue.solution || ''),
        priority: this.calculatePriority(
          this.normalizeSeverity(severity),
          this.estimateScoreImpact(severity),
        ),
      });
    }
    
    return issues;
  }

  /**
   * 识别潜在问题
   */
  private identifyPotentialIssues(result: AIAnalysisResult): IdentifiedIssue[] {
    const issues: IdentifiedIssue[] = [];

    for (const dim of result.dimensionScores) {
      const category = ISSUE_CATEGORIES[dim.name];
      const thresholds = SEVERITY_SCORE_THRESHOLDS[category] || {
        critical: 30,
        high: 50,
        medium: 65,
      };

      let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';

      if (dim.score < thresholds.critical) {
        severity = 'critical';
      } else if (dim.score < thresholds.high) {
        severity = 'high';
      } else if (dim.score < thresholds.medium) {
        severity = 'medium';
      }

      if (severity !== 'low') {
        issues.push({
          id: `issue_potential_${dim.name.replace(/\s/g, '_')}`,
          category,
          title: `${dim.name}得分过低`,
          description: dim.analysis,
          severity,
          impact: {
            dimension: dim.name,
            scoreImpact: Math.round((65 - dim.score) * 0.5),
            description: `该维度得分${dim.score}低于健康标准`,
          },
          affectedDimensions: [dim.name],
          rootCause: dim.problems.join('; ') || '未达到健康标准',
          solution: this.getGenericSolution(dim.name, dim.score),
          estimatedEffort: this.estimateEffortFromScore(dim.score),
          priority: this.calculatePriority(severity, dim.score),
        });
      }
    }

    return issues;
  }

  /**
   * 识别描述中的问题
   */
  private identifyDescribedIssues(result: AIAnalysisResult): IdentifiedIssue[] {
    const issues: IdentifiedIssue[] = [];
    const seenTitles = new Set((result.issues || []).map((i: any) => i.title || ''));

    for (const dim of result.dimensionScores) {
      for (const problem of (dim.problems || [])) {
        if (!seenTitles.has(problem)) {
          issues.push({
            id: `issue_described_${issues.length + 1}`,
            category: ISSUE_CATEGORIES[dim.name] || 'general',
            title: problem,
            description: `在${dim.name}中发现: ${problem}`,
            severity: this.inferSeverityFromProblem(problem, dim.score),
            impact: {
              dimension: dim.name,
              scoreImpact: 2,
              description: `影响${dim.name}评分`,
            },
            affectedDimensions: [dim.name],
            rootCause: problem,
            solution: this.getGenericSolution(dim.name, dim.score),
            estimatedEffort: 'medium',
            priority: 5,
          });
        }
      }
    }

    return issues;
  }

  /**
   * 规范化严重程度
   */
  private normalizeSeverity(
    severity: string,
  ): 'critical' | 'high' | 'medium' | 'low' {
    const normalized = severity.toLowerCase();
    if (['critical', 'crit', '严重'].includes(normalized)) return 'critical';
    if (['high', 'major', '重要'].includes(normalized)) return 'high';
    if (['medium', 'moderate', '中等'].includes(normalized)) return 'medium';
    return 'low';
  }

  /**
   * 推断受影响维度
   */
  private inferAffectedDimension(issue: any): string {
    // 尝试从标题或描述中推断
    const text = `${issue.title} ${issue.description}`.toLowerCase();

    for (const dimension of Object.keys(ISSUE_CATEGORIES)) {
      if (text.includes(dimension)) {
        return dimension;
      }
    }

    return '技术SEO基础'; // 默认值
  }

  /**
   * 估算分数影响
   */
  private estimateScoreImpact(severity: string): number {
    switch (this.normalizeSeverity(severity)) {
      case 'critical':
        return 15;
      case 'high':
        return 10;
      case 'medium':
        return 5;
      default:
        return 2;
    }
  }

  /**
   * 估算解决难度
   */
  private estimateEffort(solution: string): 'low' | 'medium' | 'high' {
    const text = solution.toLowerCase();

    // 简单判断
    if (text.includes('简单') || text.includes('快速') || text.includes('易')) {
      return 'low';
    }
    if (text.includes('复杂') || text.includes('长期') || text.includes('系统')) {
      return 'high';
    }
    return 'medium';
  }

  /**
   * 基于分数估算难度
   */
  private estimateEffortFromScore(score: number): 'low' | 'medium' | 'high' {
    if (score < 30) return 'high';
    if (score < 50) return 'medium';
    return 'low';
  }

  /**
   * 计算优先级
   */
  private calculatePriority(
    severity: 'critical' | 'high' | 'medium' | 'low',
    scoreImpact: number,
  ): number {
    const severityWeight = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };

    return severityWeight[severity] + Math.min(scoreImpact, 10);
  }

  /**
   * 对问题进行分类
   */
  private categorizeIssue(title: string): string {
    const text = title.toLowerCase();

    if (text.includes('技术') || text.includes('seo') || text.includes('页面')) {
      return 'technical_seo';
    }
    if (text.includes('内容') || text.includes('文章') || text.includes('关键词')) {
      return 'content_quality';
    }
    if (text.includes('外链') || text.includes('链接') || text.includes('友链')) {
      return 'link_building';
    }
    if (text.includes('用户') || text.includes('体验') || text.includes('导航')) {
      return 'user_experience';
    }
    if (text.includes('地理') || text.includes('地图') || text.includes('本地')) {
      return 'geo_optimization';
    }

    return 'general';
  }

  /**
   * 从问题描述推断严重程度
   */
  private inferSeverityFromProblem(
    problem: string,
    dimensionScore: number,
  ): 'critical' | 'high' | 'medium' | 'low' {
    const text = problem.toLowerCase();

    if (
      text.includes('严重') ||
      text.includes('缺失') ||
      text.includes('错误') ||
      dimensionScore < 30
    ) {
      return 'critical';
    }
    if (
      text.includes('不足') ||
      text.includes('需要') ||
      text.includes('优化') ||
      dimensionScore < 50
    ) {
      return 'high';
    }
    if (text.includes('可以') || text.includes('建议') || dimensionScore < 65) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * 获取通用解决方案
   */
  private getGenericSolution(dimension: string, score: number): string {
    const solutions: Record<string, string> = {
      '技术SEO基础': '进行技术SEO审计，优化网站结构、页面速度、meta标签等技术因素',
      '内容质量与相关性': '增加原创深度内容，优化关键词布局，提升内容价值',
      '外部链接与权威性': '积极建设高质量外链，获取行业权威网站的推荐',
      '用户体验': '优化网站导航结构，提升页面加载速度，改善移动端体验',
      '地理定位优化': '完善地理标签，增加本地化内容，优化Google Earth展示',
    };

    return solutions[dimension] || '建议进行全面优化改进';
  }

  /**
   * 去重并排序
   */
  private deduplicateAndSort(
    issues: IdentifiedIssue[],
  ): IdentifiedIssue[] {
    const seen = new Map<string, IdentifiedIssue>();

    for (const issue of issues) {
      const key = issue.title.toLowerCase();
      if (!seen.has(key) || issue.priority > seen.get(key)!.priority) {
        seen.set(key, issue);
      }
    }

    return Array.from(seen.values()).sort(
      (a, b) => b.priority - a.priority,
    );
  }

  /**
   * 计算摘要
   */
  private calculateSummary(
    issues: IdentifiedIssue[],
  ): IssueAnalysisResult['summary'] {
    return {
      total: issues.length,
      critical: issues.filter((i) => i.severity === 'critical').length,
      high: issues.filter((i) => i.severity === 'high').length,
      medium: issues.filter((i) => i.severity === 'medium').length,
      low: issues.filter((i) => i.severity === 'low').length,
    };
  }
}
