import { Repository } from 'typeorm';
import { DiagnosisTask, DiagnosisStatus } from '../entities/diagnosis-task.entity';
import { DiagnosisReport } from '../entities/diagnosis-report.entity';
import { CreateDiagnosisTaskDto } from '../dto/create-diagnosis-task.dto';
import { QueryDiagnosisTaskDto } from '../dto/query-diagnosis.dto';
export declare class DiagnosisTaskService {
    private diagnosisTaskRepository;
    private diagnosisReportRepository;
    constructor(diagnosisTaskRepository: Repository<DiagnosisTask>, diagnosisReportRepository: Repository<DiagnosisReport>);
    createTask(userId: string, dto: CreateDiagnosisTaskDto): Promise<DiagnosisTask>;
    queryTasks(query: QueryDiagnosisTaskDto): Promise<{
        tasks: DiagnosisTask[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getTaskById(taskId: string, userId?: string): Promise<DiagnosisTask>;
    updateTaskStatus(taskId: string, status: DiagnosisStatus, progress?: number, errorMessage?: string): Promise<DiagnosisTask>;
    updateTaskProgress(taskId: string, progress: number, message?: string): Promise<void>;
    linkReport(taskId: string, reportId: string): Promise<void>;
    cancelTask(taskId: string, userId: string): Promise<DiagnosisTask>;
    deleteTask(taskId: string, userId: string): Promise<void>;
    getReportByTaskId(taskId: string): Promise<DiagnosisReport | null>;
    getReportById(reportId: string, userId?: string): Promise<DiagnosisReport>;
    saveReport(report: Partial<DiagnosisReport>): Promise<DiagnosisReport>;
    getReportsByUserId(userId: string, page?: number, pageSize?: number): Promise<{
        reports: DiagnosisReport[];
        total: number;
    }>;
}
