export interface Strategy {
    id: string;
    brandId: string;
    name: string;
    type: string;
    content: string;
    status: 'draft' | 'active' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}
export declare class StrategyService {
    private strategies;
    getList(filters: {
        brandId?: string;
        status?: string;
    }): Promise<{
        list: Strategy[];
        total: number;
    }>;
    getById(id: string): Promise<Strategy | null>;
    generate(dto: any): Promise<Strategy>;
    private generateStrategyContent;
    update(id: string, data: Partial<Strategy>): Promise<Strategy | null>;
    delete(id: string): Promise<boolean>;
    execute(id: string): Promise<{
        success: boolean;
        message: string;
        executionId?: string;
    }>;
}
