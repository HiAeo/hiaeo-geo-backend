import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { StrategyType } from '../entities/strategy.entity';

export class CreateStrategyDto {
  @ApiProperty({ description: '品牌ID' })
  @IsString()
  brandId: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: '策略名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '策略类型', enum: StrategyType })
  @IsEnum(StrategyType)
  @IsOptional()
  type?: StrategyType;

  @ApiPropertyOptional({ description: '目标关键词' })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: '目标渠道' })
  @IsArray()
  @IsOptional()
  channels?: string[];

  @ApiPropertyOptional({ description: '诊断报告ID' })
  @IsString()
  @IsOptional()
  diagnosisReportId?: string;
}

export class UpdateStrategyDto {
  @ApiPropertyOptional({ description: '策略名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '策略状态' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '内容' })
  @IsOptional()
  content?: any;
}

export class GenerateStrategyFromReportDto {
  @ApiProperty({ description: '诊断报告ID' })
  @IsString()
  diagnosisReportId: string;

  @ApiProperty({ description: '品牌ID' })
  @IsString()
  brandId: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: '策略名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '策略类型', enum: StrategyType })
  @IsEnum(StrategyType)
  @IsOptional()
  type?: StrategyType;
}
