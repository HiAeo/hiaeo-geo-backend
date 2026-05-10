import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { I18nService } from '../services/i18n.service';
import { TranslateDto, SetLocaleDto } from '../dto/i18n.dto';

@Controller('v1/i18n')
@UseGuards(JwtAuthGuard)
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  /**
   * 获取支持的语言列表
   * GET /api/v1/i18n/locales
   */
  @Get('locales')
  async getLocales() {
    const locales = this.i18nService.getSupportedLocales();
    return { data: locales };
  }

  /**
   * 获取语言包
   * GET /api/v1/i18n/:locale
   */
  @Get(':locale')
  async getTranslations(
    @Param('locale') locale: string,
    @Query('ns') namespace?: string,
  ) {
    const translations = await this.i18nService.getTranslations(locale, namespace);
    return { data: translations };
  }

  /**
   * 翻译文本
   * POST /api/v1/i18n/translate
   */
  @Post('translate')
  async translate(@Body() dto: TranslateDto) {
    const translation = await this.i18nService.t(dto.key, dto.params, dto.locale);
    return { data: { key: dto.key, translation } };
  }

  /**
   * 设置用户语言偏好
   * POST /api/v1/i18n/set-locale
   */
  @Post('set-locale')
  async setLocale(@Body() dto: SetLocaleDto, @Req() req: any) {
    this.i18nService.setLocale(dto.locale);
    return { success: true, locale: dto.locale };
  }
}
