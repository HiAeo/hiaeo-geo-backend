import { Repository } from 'typeorm';
import { Strategy } from '../entities/strategy.entity';
import { CreateStrategyDto, UpdateStrategyDto, GenerateStrategyFromReportDto } from '../dto/strategy.dto';
import { DiagnosisTaskService } from '../../diagnosis/services/diagnosis-task.service';
export declare class StrategyService {
    private strategyRepository;
    private diagnosisTaskService;
    constructor(strategyRepository: Repository<Strategy>, diagnosisTaskService: DiagnosisTaskService);
    getList(filters: {
        brandId?: string;
        status?: string;
        userId?: string;
    }): Promise<{
        list: Strategy[];
        total: number;
    }>;
    getById(id: string): Promise<Strategy | null>;
    create(dto: CreateStrategyDto): Promise<Strategy>;
    generate(dto: any): Promise<Strategy>;
    generateFromDiagnosisReport(dto: GenerateStrategyFromReportDto): Promise<Strategy>;
    private generateStrategyFromReport;
    private generateSummary;
    private extractKeywords;
    private generateStrategyContent;
    update(id: string, dto: UpdateStrategyDto): Promise<Strategy | null>;
    delete(id: string): Promise<boolean>;
    execute(id: string): Promise<{
        success: boolean;
        message: string;
        executionId?: string;
    }>;
    updateProgress(id: string, progress: number): Promise<void>;
}
