import { IsString, IsOptional, IsEnum, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiagnosisType } from '../entities/diagnosis-task.entity';

export class DiagnosisDimensionConfigDto {
  @ApiProperty({ description: '维度名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '是否启用' })
  @IsOptional()
  enabled?: boolean = true;

  @ApiPropertyOptional({ description: '权重 (0-1)' })
  @IsOptional()
  weight?: number;
}

export class CreateDiagnosisTaskDto {
  @ApiProperty({ description: '品牌名称' })
  @IsString()
  brandName: string;

  @ApiPropertyOptional({ description: '品牌官网URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: '行业类别' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: '目标市场' })
  @IsOptional()
  @IsString()
  targetMarket?: string;

  @ApiProperty({ description: '诊断类型', enum: DiagnosisType, default: DiagnosisType.FULL })
  @IsOptional()
  @IsEnum(DiagnosisType)
  type?: DiagnosisType;

  @ApiPropertyOptional({ description: '指定AI引擎' })
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiPropertyOptional({ description: '诊断维度配置', type: [DiagnosisDimensionConfigDto] })
  @IsOptional()
  @IsArray()
  dimensions?: DiagnosisDimensionConfigDto[];

  @ApiPropertyOptional({ description: '是否包含竞品分析' })
  @IsOptional()
  includeCompetitorAnalysis?: boolean;

  @ApiPropertyOptional({ description: '竞品列表', type: [String] })
  @IsOptional()
  @IsArray()
  competitors?: string[];
}
