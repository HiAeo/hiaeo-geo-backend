import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateStrategyDto {
  @ApiPropertyOptional({ description: '品牌ID' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: '策略名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '策略类型' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: '目标关键词' })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: '目标渠道' })
  @IsArray()
  @IsOptional()
  channels?: string[];

  @ApiPropertyOptional({ description: '内容类型' })
  @IsArray()
  @IsOptional()
  contentTypes?: string[];

  @ApiPropertyOptional({ description: 'AI引擎' })
  @IsString()
  @IsOptional()
  engine?: string;
}
