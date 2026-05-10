import { Injectable } from '@nestjs/common';
import i18next from 'i18next';
import * as path from 'path';

@Injectable()
export class I18nService {
  private i18next = i18next;

  constructor() {
    this.initI18n();
  }

  private async initI18n() {
    const backendPath = path.join(__dirname, '../../../');

    await this.i18next.init({
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
  }

  /**
   * 翻译方法
   * @param key 翻译键，如 'common.buttons.save'
   * @param params 替换参数，如 { name: 'John' }
   * @param lng 语言，默认使用当前语言
   */
  async t(key: string, params?: Record<string, string>, lng?: string): Promise<string> {
    return this.i18next.t(key, { ...params, lng: lng || this.i18next.language });
  }

  /**
   * 设置语言
   */
  setLocale(locale: string): void {
    this.i18next.changeLanguage(locale);
  }

  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.i18next.language || 'zh-CN';
  }

  /**
   * 获取所有支持的语言列表
   */
  getSupportedLocales(): Array<{ code: string; name: string }> {
    return [
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en-US', name: 'English' },
    ];
  }

  /**
   * 获取语言包
   */
  async getTranslations(locale: string, namespace?: string): Promise<any> {
    const ns = namespace || 'common';
    const resources: any = {};

    for (const n of ['common', 'knowledge', 'workflow', 'errors']) {
      if (!namespace || n === ns) {
        try {
          resources[n] = await this.i18next.getResourceBundle(locale, n);
        } catch {
          resources[n] = {};
        }
      }
    }

    return resources;
  }
}
