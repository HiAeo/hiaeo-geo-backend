export declare class ConfigService {
    private readonly env;
    constructor();
    get(key: string, defaultValue?: string): string;
    getNumber(key: string, defaultValue?: number): number;
    getBoolean(key: string, defaultValue?: boolean): boolean;
    isProduction(): boolean;
    isDevelopment(): boolean;
    getDeepseekApiKey(): string;
    getKimiApiKey(): string;
    getQwenApiKey(): string;
    getZhipuApiKey(): string;
    getDoubaoApiKey(): string;
    getWenxinApiKey(): string;
    getWenxinSecretKey(): string;
    getDefaultAiEngine(): string;
    getPort(): number;
    getJwtSecret(): string;
    getJwtExpiration(): string;
}
