import i18next from 'i18next';
import * as fs from 'fs';
import * as path from 'path';

export const initI18n = () => {
  const backendPath = path.join(__dirname, '../../');

  i18next
    .init({
      lng: 'zh-CN',
      fallbackLng: 'zh-CN',
      preload: ['zh-CN', 'en-US'],
      ns: ['common', 'knowledge', 'workflow', 'errors'],
      defaultNS: 'common',
      backend: {
        loadPath: path.join(backendPath, 'src/i18n/{{lng}}/{{ns}}.json'),
      },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18next;
};

export const supportedLocales = ['zh-CN', 'en-US'] as const;
export type SupportedLocale = typeof supportedLocales[number];

export const localeNames: Record<SupportedLocale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};
