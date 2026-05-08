"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueIdentifierService = void 0;
const common_1 = require("@nestjs/common");
const ISSUE_CATEGORIES = {
    '技术SEO基础': 'technical_seo',
    '内容质量与相关性': 'content_quality',
    '外部链接与权威性': 'link_building',
    '用户体验': 'user_experience',
    '地理定位优化': 'geo_optimization',
};
const SEVERITY_SCORE_THRESHOLDS = {
    'technical_seo': { critical: 30, high: 50, medium: 65 },
    'content_quality': { critical: 25, high: 45, medium: 60 },
    'link_building': { critical: 20, high: 40, medium: 55 },
    'user_experience': { critical: 35, high: 55, medium: 70 },
    'geo_optimization': { critical: 30, high: 50, medium: 65 },
};
let IssueIdentifierService = class IssueIdentifierService {
    identify(aiResult, enginesUsed) {
        const issues = [];
        const aiIssues = this.extractFromAIResult(aiResult);
        issues.push(...aiIssues);
        const potentialIssues = this.identifyPotentialIssues(aiResult);
        issues.push(...potentialIssues);
        const describedIssues = this.identifyDescribedIssues(aiResult);
        issues.push(...describedIssues);
        const uniqueIssues = this.deduplicateAndSort(issues);
        const summary = this.calculateSummary(uniqueIssues);
        return {
            issues: uniqueIssues,
            summary,
        };
    }
    extractFromAIResult(result) {
        return result.issues.map((issue, index) => ({
            id: issue.id || `issue_ai_${index + 1}`,
            category: this.categorizeIssue(issue.title),
            title: issue.title,
            description: issue.description,
            severity: this.normalizeSeverity(issue.severity),
            impact: {
                dimension: this.inferAffectedDimension(issue),
                scoreImpact: this.estimateScoreImpact(issue.severity),
                description: issue.impact,
            },
            affectedDimensions: [this.inferAffectedDimension(issue)],
            rootCause: issue.description,
            solution: issue.solution,
            estimatedEffort: this.estimateEffort(issue.solution),
            priority: this.calculatePriority(this.normalizeSeverity(issue.severity), this.estimateScoreImpact(issue.severity)),
        }));
    }
    identifyPotentialIssues(result) {
        const issues = [];
        for (const dim of result.dimensionScores) {
            const category = ISSUE_CATEGORIES[dim.name];
            const thresholds = SEVERITY_SCORE_THRESHOLDS[category] || {
                critical: 30,
                high: 50,
                medium: 65,
            };
            let severity = 'low';
            if (dim.score < thresholds.critical) {
                severity = 'critical';
            }
            else if (dim.score < thresholds.high) {
                severity = 'high';
            }
            else if (dim.score < thresholds.medium) {
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
    identifyDescribedIssues(result) {
        const issues = [];
        const seenTitles = new Set(result.issues.map((i) => i.title));
        for (const dim of result.dimensionScores) {
            for (const problem of dim.problems) {
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
    normalizeSeverity(severity) {
        const normalized = severity.toLowerCase();
        if (['critical', 'crit', '严重'].includes(normalized))
            return 'critical';
        if (['high', 'major', '重要'].includes(normalized))
            return 'high';
        if (['medium', 'moderate', '中等'].includes(normalized))
            return 'medium';
        return 'low';
    }
    inferAffectedDimension(issue) {
        const text = `${issue.title} ${issue.description}`.toLowerCase();
        for (const dimension of Object.keys(ISSUE_CATEGORIES)) {
            if (text.includes(dimension)) {
                return dimension;
            }
        }
        return '技术SEO基础';
    }
    estimateScoreImpact(severity) {
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
    estimateEffort(solution) {
        const text = solution.toLowerCase();
        if (text.includes('简单') || text.includes('快速') || text.includes('易')) {
            return 'low';
        }
        if (text.includes('复杂') || text.includes('长期') || text.includes('系统')) {
            return 'high';
        }
        return 'medium';
    }
    estimateEffortFromScore(score) {
        if (score < 30)
            return 'high';
        if (score < 50)
            return 'medium';
        return 'low';
    }
    calculatePriority(severity, scoreImpact) {
        const severityWeight = {
            critical: 40,
            high: 30,
            medium: 20,
            low: 10,
        };
        return severityWeight[severity] + Math.min(scoreImpact, 10);
    }
    categorizeIssue(title) {
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
    inferSeverityFromProblem(problem, dimensionScore) {
        const text = problem.toLowerCase();
        if (text.includes('严重') ||
            text.includes('缺失') ||
            text.includes('错误') ||
            dimensionScore < 30) {
            return 'critical';
        }
        if (text.includes('不足') ||
            text.includes('需要') ||
            text.includes('优化') ||
            dimensionScore < 50) {
            return 'high';
        }
        if (text.includes('可以') || text.includes('建议') || dimensionScore < 65) {
            return 'medium';
        }
        return 'low';
    }
    getGenericSolution(dimension, score) {
        const solutions = {
            '技术SEO基础': '进行技术SEO审计，优化网站结构、页面速度、meta标签等技术因素',
            '内容质量与相关性': '增加原创深度内容，优化关键词布局，提升内容价值',
            '外部链接与权威性': '积极建设高质量外链，获取行业权威网站的推荐',
            '用户体验': '优化网站导航结构，提升页面加载速度，改善移动端体验',
            '地理定位优化': '完善地理标签，增加本地化内容，优化Google Earth展示',
        };
        return solutions[dimension] || '建议进行全面优化改进';
    }
    deduplicateAndSort(issues) {
        const seen = new Map();
        for (const issue of issues) {
            const key = issue.title.toLowerCase();
            if (!seen.has(key) || issue.priority > seen.get(key).priority) {
                seen.set(key, issue);
            }
        }
        return Array.from(seen.values()).sort((a, b) => b.priority - a.priority);
    }
    calculateSummary(issues) {
        return {
            total: issues.length,
            critical: issues.filter((i) => i.severity === 'critical').length,
            high: issues.filter((i) => i.severity === 'high').length,
            medium: issues.filter((i) => i.severity === 'medium').length,
            low: issues.filter((i) => i.severity === 'low').length,
        };
    }
};
exports.IssueIdentifierService = IssueIdentifierService;
exports.IssueIdentifierService = IssueIdentifierService = __decorate([
    (0, common_1.Injectable)()
], IssueIdentifierService);
//# sourceMappingURL=issue-identifier.service.js.map