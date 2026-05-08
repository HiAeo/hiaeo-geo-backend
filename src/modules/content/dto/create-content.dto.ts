import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateContentDto {
  @ApiProperty({ description: '内容标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '内容正文' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: '内容类型' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: '内容状态' })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
