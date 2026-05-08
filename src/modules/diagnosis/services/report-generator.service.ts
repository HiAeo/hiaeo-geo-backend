import { Injectable } from '@nestjs/common';
import { DiagnosisTask } from '../entities/diagnosis-task.entity';
import { EngineManager } from '../../ai/adapters/engine-manager';
import {
  HealthScoreResult,
  CompetitorAnalysisResult,
  IssueAnalysisResult,
  ReportGenerationResult,
  ReportSection,
} from '../interfaces/diagnosis.interface';

@Injectable()
export class ReportGeneratorService {
  constructor(private engineManager: EngineManager) {}

  async generate(
    task: DiagnosisTask,
    healthScore: HealthScoreResult,
    competitorAnalysis: CompetitorAnalysisResult | null,
    issueAnalysis: IssueAnalysisResult,
  ): Promise<ReportGenerationResult> {
    const sections: ReportSection[] = [];

    const executiveSummary = await this.generateExecutiveSummary(
      task.brandName,
      healthScore,
      competitorAnalysis,
      issueAnalysis,
    );
    sections.push({
      title: '执行摘要',
      content: executiveSummary,
      type: 'overview',
    });

    sections.push({
      title: '健康评分概览',
      content: this.generateHealthScoreSection(healthScore),
      type: 'overview',
    });

    sections.push({
      title: '各维度详细分析',
      content: this.generateDimensionAnalysisSection(healthScore),
      type: 'analysis',
    });

    if (issueAnalysis.issues.length > 0) {
      sections.push({
        title: '问题与风险',
        content: await this.generateIssueSection(task.brandName, issueAnalysis),
        type: 'analysis',
      });
    }

    if (competitorAnalysis) {
      sections.push({
        title: '竞品分析',
        content: this.generateCompetitorSection(competitorAnalysis),
        type: 'competitor',
      });
    }

    sections.push({
      title: '优化建议',
      content: await this.generateSuggestionsSection(
        task.brandName,
        healthScore,
        issueAnalysis,
      ),
      type: 'action_plan',
    });

    const aiInsights = await this.generateAIInsights(
      task.brandName,
      healthScore,
      issueAnalysis,
    );

    return {
      reportId: `report_${Date.now()}`,
      executiveSummary,
      aiInsights,
      sections,
      generatedAt: new Date(),
    };
  }

  private async generateExecutiveSummary(
    brandName: string,
    healthScore: HealthScoreResult,
    competitorAnalysis: CompetitorAnalysisResult | null,
    issueAnalysis: IssueAnalysisResult,
  ): Promise<string> {
    const gradeDescriptions: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差',
      very_poor: '很差',
    };

    const criticalIssues = issueAnalysis.summary.critical;
    const highIssues = issueAnalysis.summary.high;

    let summary = `# ${brandName} GEO健康诊断执行摘要

## 总体评分
- **综合得分**: ${healthScore.overallScore} 分
- **评级**: ${gradeDescriptions[healthScore.grade] || '未知'}
- **健康等级**: ${healthScore.healthLevel}/5

## 诊断结果概要
${brandName} 在GEO优化方面的表现${gradeDescriptions[healthScore.grade]}。`;

    if (criticalIssues > 0) {
      summary += `\n\n重要提示: 发现 ${criticalIssues} 个严重问题需要立即处理`;
    }

    if (highIssues > 0) {
      summary += `\n\n建议关注: 发现 ${highIssues} 个高优先级问题`;
    }

    if (competitorAnalysis) {
      summary += `\n\n## 竞品对比
- **主要竞品**: ${competitorAnalysis.competitors.length} 个`;
    }

    summary += `\n\n## 下一步建议
1. 优先处理 ${criticalIssues > 0 ? '严重' : '高优先级'}问题
2. 关注得分较低的维度
3. 制定持续优化计划`;

    return summary;
  }

  private generateHealthScoreSection(healthScore: HealthScoreResult): string {
    let content = `# 健康评分概览\n\n`;
    content += `| 维度 | 评分 | 权重 | 贡献分 |\n`;
    content += `|------|------|------|--------|\n`;

    for (const dim of healthScore.dimensionScores) {
      content += `| ${dim.name} | ${dim.score} | ${(dim.weight * 100).toFixed(0)}% | ${Math.round(dim.score * dim.weight)} |\n`;
    }

    content += `\n**综合评分**: ${healthScore.overallScore} / 100\n`;
    content += `**评级**: ${healthScore.grade}\n`;

    return content;
  }

  private generateDimensionAnalysisSection(healthScore: HealthScoreResult): string {
    let content = `# 各维度详细分析\n\n`;

    for (const dim of healthScore.dimensionScores) {
      const statusEmoji = dim.score >= 75 ? 'OK' : dim.score >= 60 ? 'Warning' : 'Fail';
      content += `## ${statusEmoji} ${dim.name}\n\n`;
      content += `**评分**: ${dim.score}/100\n`;
      content += `**分析**: ${dim.analysis}\n`;

      if (dim.trend) {
        content += `**趋势**: ${dim.trend}\n`;
      }

      content += '\n---\n\n';
    }

    return content;
  }

  private async generateIssueSection(
    brandName: string,
    issueAnalysis: IssueAnalysisResult,
  ): Promise<string> {
    const severityOrder = ['critical', 'high', 'medium', 'low'];

    let content = `# 问题与风险分析\n\n`;
    content += `共发现 ${issueAnalysis.summary.total} 个问题：\n`;
    content += `- 严重: ${issueAnalysis.summary.critical} 个\n`;
    content += `- 高: ${issueAnalysis.summary.high} 个\n`;
    content += `- 中: ${issueAnalysis.summary.medium} 个\n`;
    content += `- 低: ${issueAnalysis.summary.low} 个\n\n`;

    for (const severity of severityOrder) {
      const issues = issueAnalysis.issues.filter((i) => i.severity === severity);
      if (issues.length === 0) continue;

      const severityTitle: Record<string, string> = {
        critical: '严重问题 (需立即处理)',
        high: '高优先级问题',
        medium: '中优先级问题',
        low: '低优先级问题',
      };

      content += `## ${severityTitle[severity]}\n\n`;

      for (const issue of issues) {
        content += `### ${issue.title}\n\n`;
        content += `**描述**: ${issue.description}\n\n`;
        content += `**影响维度**: ${issue.affectedDimensions?.join(', ') || '未知'}\n\n`;
        content += `**解决方案**: ${issue.solution}\n\n`;
        content += `**预估工时**: ${issue.estimatedEffort}\n\n`;
        content += `---\n\n`;
      }
    }

    return content;
  }

  private generateCompetitorSection(analysis: CompetitorAnalysisResult): string {
    let content = `# 竞品分析\n\n`;

    content += `## 竞品对比\n\n`;

    for (const competitor of analysis.competitors || []) {
      const strengths = competitor.strengths?.join(', ') || '-';
      const weaknesses = competitor.weaknesses?.join(', ') || '-';
      content += `- **${competitor.competitorName}**: 优势: ${strengths}, 劣势: ${weaknesses}\n`;
    }

    if (analysis.marketGaps?.length > 0) {
      content += `\n## 市场机会\n\n`;
      for (const opp of analysis.marketGaps) {
        content += `- ${opp}\n`;
      }
    }

    return content;
  }

  private async generateSuggestionsSection(
    brandName: string,
    healthScore: HealthScoreResult,
    issueAnalysis: IssueAnalysisResult,
  ): Promise<string> {
    const suggestions = issueAnalysis.issues
      .filter((i) => i.severity === 'critical' || i.severity === 'high')
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10)
      .map((issue) => ({
        title: issue.title,
        solution: issue.solution,
        effort: issue.estimatedEffort,
        impact: issue.impact?.scoreImpact || 0,
      }));

    let content = `# 优化建议\n\n`;
    content += `基于诊断结果，为您提供以下优化建议：\n\n`;

    for (let i = 0; i < suggestions.length; i++) {
      const s = suggestions[i];
      content += `## ${i + 1}. ${s.title}\n\n`;
      content += `**建议措施**: ${s.solution}\n\n`;
      content += `**预估工时**: ${s.effort === 'low' ? '1-3天' : s.effort === 'medium' ? '1-2周' : '1个月以上'}\n`;
      content += `**预期提升**: +${s.impact}分\n\n`;
    }

    return content;
  }

  private async generateAIInsights(
    brandName: string,
    healthScore: HealthScoreResult,
    issueAnalysis: IssueAnalysisResult,
  ): Promise<string> {
    const prompt = `
请为"${brandName}"提供GEO优化的AI智能洞察。

当前状态:
- 综合评分: ${healthScore.overallScore}/100
- 评级: ${healthScore.grade}
- 问题数量: ${issueAnalysis.summary.total}个
  - 严重: ${issueAnalysis.summary.critical}
  - 高: ${issueAnalysis.summary.high}

主要问题:
${issueAnalysis.issues.slice(0, 3).map((i) => `- ${i.title}: ${i.description}`).join('\n')}

请提供简洁专业的洞察。
`;

    try {
      const response = await this.engineManager.chat({
        messages: [{ role: 'user', content: prompt }],
      });
      return response.message.content;
    } catch (error) {
      console.error('AI洞察生成失败:', error);
      return 'AI洞察暂时不可用，请稍后重试。';
    }
  }
}
