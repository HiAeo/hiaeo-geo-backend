export declare enum DiagnosisStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum DiagnosisType {
    FULL = "full",
    QUICK = "quick",
    COMPETITOR = "competitor",
    TRACKING = "tracking"
}
export declare class DiagnosisTask {
    id: string;
    userId: string;
    organizationId: string;
    brandId: string;
    brandName: string;
    website: string;
    industry: string;
    targetMarket: string;
    type: DiagnosisType;
    status: DiagnosisStatus;
    aiEngine: string;
    progress: number;
    config: Record<string, any>;
    reportId: string;
    errorMessage: string;
    startedAt: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
