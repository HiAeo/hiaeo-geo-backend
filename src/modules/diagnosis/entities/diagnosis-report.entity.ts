import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum ReportGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  VERY_POOR = 'very_poor',
}

@Entity('diagnosis_reports')
export class DiagnosisReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'brand_name' })
  brandName: string;

  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @Column({
    name: 'grade',
    type: 'enum',
    enum: ReportGrade,
    default: ReportGrade.FAIR,
  })
  grade: ReportGrade;

  @Column({ name: 'health_level', type: 'int', default: 0 })
  healthLevel: number;

  @Column({ type: 'jsonb' })
  dimensionScores: any[];

  @Column({ type: 'jsonb', nullable: true })
  competitorAnalysis: any;

  @Column({ type: 'jsonb' })
  issues: any[];

  @Column({ type: 'jsonb' })
  suggestions: any[];

  @Column({ name: 'executive_summary', type: 'text' })
  executiveSummary: string;

  @Column({ name: 'ai_insights', type: 'text', nullable: true })
  aiInsights: string;

  @Column({ type: 'jsonb', nullable: true })
  rawAiResponse: Record<string, any>;

  @Column({ name: 'engines_used', type: 'jsonb', default: [] })
  enginesUsed: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
