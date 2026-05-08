import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiagnosisStatus, DiagnosisType } from '../entities/diagnosis-task.entity';

export class QueryDiagnosisTaskDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '诊断状态', enum: DiagnosisStatus })
  @IsOptional()
  @IsEnum(DiagnosisStatus)
  status?: DiagnosisStatus;

  @ApiPropertyOptional({ description: '诊断类型', enum: DiagnosisType })
  @IsOptional()
  @IsEnum(DiagnosisType)
  type?: DiagnosisType;

  @ApiPropertyOptional({ description: '品牌名称' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}
