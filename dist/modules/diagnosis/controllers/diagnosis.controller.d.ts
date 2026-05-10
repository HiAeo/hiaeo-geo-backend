import { DiagnosisTaskService } from '../services/diagnosis-task.service';
import { DiagnosisExecutorService } from '../services/diagnosis-executor.service';
import { CreateDiagnosisTaskDto, QueryDiagnosisTaskDto, DiagnosisTaskResponseDto, DiagnosisReportResponseDto } from '../dto';
import { DiagnosisStatus } from '../entities/diagnosis-task.entity';
export declare class DiagnosisController {
    private readonly taskService;
    private readonly executor;
    constructor(taskService: DiagnosisTaskService, executor: DiagnosisExecutorService);
    createTask(userId: string, dto: CreateDiagnosisTaskDto): Promise<{
        success: boolean;
        data: DiagnosisTaskResponseDto;
        message: string;
    }>;
    private runDiagnosisAsync;
    queryTasks(userId: string, query: QueryDiagnosisTaskDto): Promise<{
        success: boolean;
        data: {
            tasks: DiagnosisTaskResponseDto[];
            total: number;
            page: number;
            pageSize: number;
        };
    }>;
    getTask(userId: string, taskId: string): Promise<{
        success: boolean;
        data: DiagnosisTaskResponseDto;
    }>;
    getTaskProgress(userId: string, taskId: string): Promise<{
        success: boolean;
        data: {
            taskId: string;
            status: DiagnosisStatus;
            progress: number;
            startedAt: Date;
            completedAt: Date;
            errorMessage: string;
        };
    }>;
    cancelTask(userId: string, taskId: string): Promise<{
        success: boolean;
        data: DiagnosisTaskResponseDto;
        message: string;
    }>;
    retryTask(userId: string, taskId: string): Promise<{
        success: boolean;
        data: {
            taskId: string;
            reportId: string | undefined;
            steps: {
                name: string;
                status: "success" | "failed" | "skipped";
                duration: number;
                error?: string;
            }[];
        };
        message: string | undefined;
    }>;
    deleteTask(userId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getReport(userId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: DiagnosisReportResponseDto;
        message?: undefined;
    }>;
    getReports(userId: string, page?: number, pageSize?: number): Promise<{
        success: boolean;
        data: {
            reports: DiagnosisReportResponseDto[];
            total: number;
        };
    }>;
    getReportById(userId: string, reportId: string): Promise<{
        success: boolean;
        data: DiagnosisReportResponseDto;
    }>;
    private mapTaskToResponse;
    private mapReportToResponse;
}
