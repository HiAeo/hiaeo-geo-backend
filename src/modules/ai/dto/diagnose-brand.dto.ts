import { IsString, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiagnosisDimensionDto {
  @ApiProperty({ description: '维度名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权重 (0-1)' })
  @IsNumber()
  weight: number;

  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  enabled: boolean;
}

export class DiagnoseBrandDto {
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

  @ApiPropertyOptional({ description: '诊断维度配置', type: [DiagnosisDimensionDto] })
  @IsOptional()
  @IsArray()
  dimensions?: DiagnosisDimensionDto[];
}
