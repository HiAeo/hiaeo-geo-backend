export declare const initI18n: () => import("i18next").i18n;
export declare const supportedLocales: readonly ["zh-CN", "en-US"];
export type SupportedLocale = typeof supportedLocales[number];
export declare const localeNames: Record<SupportedLocale, string>;
