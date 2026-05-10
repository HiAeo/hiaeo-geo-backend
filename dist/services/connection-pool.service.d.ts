import { OnModuleDestroy } from '@nestjs/common';
import { IVectorProvider } from '../interfaces/vector-provider.interface';
export declare class ConnectionPool implements OnModuleDestroy {
    private readonly logger;
    private pool;
    private readonly maxConnections;
    private readonly connectionTimeout;
    constructor();
    getConnection(key: string): Promise<IVectorProvider>;
    releaseConnection(key: string): Promise<void>;
    closeConnection(key: string): Promise<void>;
    getPoolStatus(): {
        totalConnections: number;
        availableConnections: number;
        usedConnections: number;
        connections: {
            key: string;
            inUse: boolean;
            createdAt: Date;
            lastUsed: Date;
        }[];
    };
    private releaseLeastUsed;
    clear(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
