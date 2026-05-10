import { IVectorProvider } from '../interfaces/vector-provider.interface';
import { VectorDbProvider } from '../config/vector-db.config';
export declare class VectorDbFactory {
    private readonly logger;
    static createProvider(type?: VectorDbProvider): IVectorProvider;
    static getDefaultProvider(): IVectorProvider;
    static getProviderName(): string;
    static isProductionProvider(): boolean;
    static getSafeConfig(): Record<string, any>;
    private static logWarning;
}
