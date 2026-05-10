import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StrategyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum StrategyType {
  CONTENT = 'content',
  SEO = 'seo',
  SOCIAL = 'social',
  MOFA = 'mofa',
  HYBRID = 'hybrid',
}

@Entity('strategies')
@Index(['brandId'])
@Index(['status'])
export class Strategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'brand_id' })
  brandId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: StrategyType,
    default: StrategyType.CONTENT,
  })
  type: StrategyType;

  @Column({
    type: 'simple-enum',
    enum: StrategyStatus,
    default: StrategyStatus.DRAFT,
  })
  status: StrategyStatus;

  @Column({ type: 'json' })
  content: StrategyContent;

  @Column({ name: 'diagnosis_report_id', nullable: true })
  diagnosisReportId: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ name: 'target_keywords', type: 'json', nullable: true })
  targetKeywords: string[];

  @Column({ name: 'target_channels', type: 'json', nullable: true })
  targetChannels: string[];

  @Column({ name: 'execution_progress', type: 'int', default: 0 })
  executionProgress: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export interface StrategyContent {
  objectives: string[];
  keywords: string[];
  channels: string[];
  contentTypes: string[];
  timeline: {
    phase: string;
    duration: string;
    tasks: string[];
    milestones: string[];
  }[];
  recommendations: {
    priority: number;
    title: string;
    description: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
  }[];
  kpis: {
    name: string;
    target: number;
    current: number;
  }[];
}
