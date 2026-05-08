import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ContentType {
  SOCIAL_POST = 'social_post',
  ARTICLE = 'article',
  AD_COPY = 'ad_copy',
  PRODUCT_DESCRIPTION = 'product_description',
}

export class GenerateContentDto {
  @ApiProperty({ description: '内容类型', enum: ContentType })
  @IsEnum(ContentType)
  contentType: 'social_post' | 'article' | 'ad_copy' | 'product_description';

  @ApiProperty({ description: '主题/关键词' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: '语气风格', enum: ['professional', 'casual', 'humorous', 'inspirational'] })
  @IsOptional()
  @IsString()
  tone?: 'professional' | 'casual' | 'humorous' | 'inspirational';

  @ApiPropertyOptional({ description: '目标受众' })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({ description: '关键词列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: '最大字数' })
  @IsOptional()
  @IsNumber()
  maxLength?: number;
}
