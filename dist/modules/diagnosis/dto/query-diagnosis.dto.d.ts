import { DiagnosisStatus, DiagnosisType } from '../entities/diagnosis-task.entity';
export declare class QueryDiagnosisTaskDto {
    userId?: string;
    status?: DiagnosisStatus;
    type?: DiagnosisType;
    brandName?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
