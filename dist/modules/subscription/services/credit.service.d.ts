import { Repository, DataSource } from 'typeorm';
import { Credit, CreditTransaction, TransactionType, SourceType } from '../entities/credit.entity';
export interface EarnCreditsDto {
    userId: string;
    amount: number;
    sourceType: SourceType;
    description?: string;
    relatedOrderId?: string;
}
export interface ConsumeCreditsDto {
    userId: string;
    amount: number;
    sourceType: SourceType;
    description?: string;
}
export interface TransactionFilter {
    userId: string;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
export declare class CreditService {
    private creditRepository;
    private transactionRepository;
    private dataSource;
    constructor(creditRepository: Repository<Credit>, transactionRepository: Repository<CreditTransaction>, dataSource: DataSource);
    getBalance(userId: string): Promise<number>;
    getCreditInfo(userId: string): Promise<Credit>;
    earnCredits(dto: EarnCreditsDto): Promise<CreditTransaction>;
    consumeCredits(dto: ConsumeCreditsDto): Promise<CreditTransaction>;
    refundCredits(userId: string, amount: number, description: string, relatedOrderId?: string): Promise<CreditTransaction>;
    getTransactions(filter: TransactionFilter): Promise<{
        transactions: CreditTransaction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    hasEnoughCredits(userId: string, amount: number): Promise<boolean>;
    batchEarnCredits(userIds: string[], amount: number, sourceType: SourceType, description: string): Promise<({
        userId: string;
        success: boolean;
        transaction: CreditTransaction;
        error?: undefined;
    } | {
        userId: string;
        success: boolean;
        error: any;
        transaction?: undefined;
    })[]>;
}
