import { CreditService } from '../services/credit.service';
import { TransactionType } from '../entities/credit.entity';
export declare class CreditController {
    private readonly creditService;
    constructor(creditService: CreditService);
    getBalance(userId: string): Promise<{
        balance: number;
    }>;
    getCreditInfo(userId: string): Promise<import("../entities/credit.entity").Credit>;
    getTransactions(userId: string, type?: TransactionType, page?: string, limit?: string): Promise<{
        transactions: import("../entities/credit.entity").CreditTransaction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    earnCredits(userId: string, body: {
        amount: number;
        description?: string;
    }): Promise<import("../entities/credit.entity").CreditTransaction>;
    consumeCredits(userId: string, body: {
        amount: number;
        description?: string;
    }): Promise<import("../entities/credit.entity").CreditTransaction>;
}
