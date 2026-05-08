import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiagnosisStatus, DiagnosisType } from '../entities/diagnosis-task.entity';
import { ReportGrade } from '../entities/diagnosis-report.entity';

export class DiagnosisTaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  brandName: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiProperty()
  type: DiagnosisType;

  @ApiProperty({ enum: DiagnosisStatus })
  status: DiagnosisStatus;

  @ApiProperty()
  progress: number;

  @ApiPropertyOptional()
  reportId?: string;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class DiagnosisReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  taskId: string;

  @ApiProperty()
  brandName: string;

  @ApiProperty()
  overallScore: number;

  @ApiProperty({ enum: ReportGrade })
  grade: ReportGrade;

  @ApiProperty()
  healthLevel: number;

  @ApiProperty()
  dimensionScores: any[];

  @ApiPropertyOptional()
  competitorAnalysis?: any;

  @ApiProperty()
  issues: any[];

  @ApiProperty()
  suggestions: any[];

  @ApiProperty()
  executiveSummary: string;

  @ApiPropertyOptional()
  aiInsights?: string;

  @ApiProperty()
  createdAt: Date;
}

export class DiagnosisProgressDto {
  @ApiProperty()
  taskId: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  status: DiagnosisStatus;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  currentStep?: string;
}
