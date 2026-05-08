import { DiagnosisTask } from '../entities/diagnosis-task.entity';
import { EngineManager } from '../../ai/adapters/engine-manager';
import { HealthScoreResult, CompetitorAnalysisResult, IssueAnalysisResult, ReportGenerationResult } from '../interfaces/diagnosis.interface';
export declare class ReportGeneratorService {
    private engineManager;
    constructor(engineManager: EngineManager);
    generate(task: DiagnosisTask, healthScore: HealthScoreResult, competitorAnalysis: CompetitorAnalysisResult | null, issueAnalysis: IssueAnalysisResult): Promise<ReportGenerationResult>;
    private generateExecutiveSummary;
    private generateHealthScoreSection;
    private generateDimensionAnalysisSection;
    private generateIssueSection;
    private generateCompetitorSection;
    private generateSuggestionsSection;
    private generateAIInsights;
}
