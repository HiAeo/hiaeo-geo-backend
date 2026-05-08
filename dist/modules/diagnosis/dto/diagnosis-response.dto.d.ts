import { DiagnosisStatus, DiagnosisType } from '../entities/diagnosis-task.entity';
import { ReportGrade } from '../entities/diagnosis-report.entity';
export declare class DiagnosisTaskResponseDto {
    id: string;
    userId: string;
    brandName: string;
    website?: string;
    type: DiagnosisType;
    status: DiagnosisStatus;
    progress: number;
    reportId?: string;
    errorMessage?: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
}
export declare class DiagnosisReportResponseDto {
    id: string;
    taskId: string;
    brandName: string;
    overallScore: number;
    grade: ReportGrade;
    healthLevel: number;
    dimensionScores: any[];
    competitorAnalysis?: any;
    issues: any[];
    suggestions: any[];
    executiveSummary: string;
    aiInsights?: string;
    createdAt: Date;
}
export declare class DiagnosisProgressDto {
    taskId: string;
    progress: number;
    status: DiagnosisStatus;
    message?: string;
    currentStep?: string;
}
