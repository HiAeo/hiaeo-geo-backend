/**
 * 诊断模块核心接口定义
 */

export interface DiagnosisConfig {
  type: 'full' | 'quick' | 'competitor' | 'tracking';
  engine?: string;
  dimensions?: DiagnosisDimensionConfig[];
  includeCompetitorAnalysis?: boolean;
  competitors?: string[];
  custom?: Record<string, any>;
}

export interface DiagnosisDimensionConfig {
  name: string;
  enabled: boolean;
  weight?: number;
}

export interface DiagnosisProgressCallback {
  (progress: number, message: string): void;
}

export interface CompetitorInfo {
  name: string;
  website?: string;
  industry?: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
}

export interface HealthScoreResult {
  overallScore: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
  healthLevel: number;
  dimensionScores: DimensionHealthScore[];
  riskFactors: RiskFactor[];
}

export interface DimensionHealthScore {
  name: string;
  score: number;
  weight: number;
  analysis: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface RiskFactor {
  dimension: string;
  risk: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface IssueAnalysisResult {
  issues: IdentifiedIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface IdentifiedIssue {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: {
    dimension: string;
    scoreImpact: number;
    description: string;
  };
  affectedDimensions?: string[];
  rootCause: string;
  solution: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  priority: number;
}

export interface CompetitorAnalysisResult {
  selfBrand: string;
  competitors: CompetitorComparison[];
  positioningMap?: PositioningPoint[];
  marketGaps: string[];
  recommendations: string[];
}

export interface CompetitorComparison {
  competitorName: string;
  overallScore?: number;
  dimensionScores?: any[];
  strengths: string[];
  weaknesses: string[];
  gap: number;
}

export interface PositioningPoint {
  x: number;
  y: number;
  label: string;
  type: 'self' | 'competitor';
}

export interface MarketOpportunity {
  title: string;
  description: string;
  potential: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface MarketThreat {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ReportGenerationResult {
  reportId: string;
  executiveSummary: string;
  aiInsights: string;
  sections: ReportSection[];
  generatedAt: Date;
}

export interface ReportSection {
  title: string;
  content: string;
  type: 'overview' | 'analysis' | 'suggestions' | 'competitor' | 'action_plan';
}
