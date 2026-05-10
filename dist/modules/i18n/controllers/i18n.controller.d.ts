import { I18nService } from '../services/i18n.service';
import { TranslateDto, SetLocaleDto } from '../dto/i18n.dto';
export declare class I18nController {
    private readonly i18nService;
    constructor(i18nService: I18nService);
    getLocales(): Promise<{
        data: {
            code: string;
            name: string;
        }[];
    }>;
    getTranslations(locale: string, namespace?: string): Promise<{
        data: any;
    }>;
    translate(dto: TranslateDto): Promise<{
        data: {
            key: string;
            translation: string;
        };
    }>;
    setLocale(dto: SetLocaleDto, req: any): Promise<{
        success: boolean;
        locale: string;
    }>;
}
