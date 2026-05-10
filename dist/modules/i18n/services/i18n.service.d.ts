export declare class I18nService {
    private i18next;
    constructor();
    private initI18n;
    t(key: string, params?: Record<string, string>, lng?: string): Promise<string>;
    setLocale(locale: string): void;
    getLocale(): string;
    getSupportedLocales(): Array<{
        code: string;
        name: string;
    }>;
    getTranslations(locale: string, namespace?: string): Promise<any>;
}
