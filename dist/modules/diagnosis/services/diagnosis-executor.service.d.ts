import { DiagnosisTaskService } from './diagnosis-task.service';
import { HealthScoreCalculatorService } from './health-score-calculator.service';
import { CompetitorAnalyzerService } from './competitor-analyzer.service';
import { IssueIdentifierService } from './issue-identifier.service';
import { ReportGeneratorService } from './report-generator.service';
import { EngineManager } from '../../ai/adapters/engine-manager';
export interface DiagnosisExecutionResult {
    success: boolean;
    taskId: string;
    reportId?: string;
    error?: string;
    steps: {
        name: string;
        status: 'success' | 'failed' | 'skipped';
        duration: number;
        error?: string;
    }[];
}
export declare class DiagnosisExecutorService {
    private taskService;
    private engineManager;
    private healthScoreCalculator;
    private competitorAnalyzer;
    private issueIdentifier;
    private reportGenerator;
    private readonly logger;
    constructor(taskService: DiagnosisTaskService, engineManager: EngineManager, healthScoreCalculator: HealthScoreCalculatorService, competitorAnalyzer: CompetitorAnalyzerService, issueIdentifier: IssueIdentifierService, reportGenerator: ReportGeneratorService);
    execute(taskId: string): Promise<DiagnosisExecutionResult>;
    private executeWithTiming;
    private executeAIDiagnosis;
    private executeHealthScoreCalculation;
    private executeCompetitorAnalysis;
    private executeIssueIdentification;
    private executeReportGeneration;
    private generateSuggestionsFromIssues;
    private getEffortTimeline;
    cancelExecution(taskId: string): Promise<void>;
}
