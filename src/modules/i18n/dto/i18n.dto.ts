import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslateDto {
  @ApiProperty({ description: '翻译键，如 common.buttons.save' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ description: '目标语言，默认 zh-CN' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ description: '替换参数，如 { name: "John" }' })
  @IsOptional()
  params?: Record<string, string>;
}

export class SetLocaleDto {
  @ApiProperty({ description: '语言代码，如 zh-CN 或 en-US' })
  @IsString()
  locale: string;
}
