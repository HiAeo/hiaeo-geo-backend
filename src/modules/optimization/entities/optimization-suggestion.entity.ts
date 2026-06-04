import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum SuggestionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISMISSED = 'dismissed',
}

export enum SuggestionCategory {
  KEYWORD = 'keyword',
  CONTENT = 'content',
  LOCAL = 'local',
  AUTHORITY = 'authority',
  TECHNICAL = 'technical',
  COMPETITOR = 'competitor',
}

export enum SuggestionPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('optimization_suggestions')
@Index(['brandId', 'status'])
@Index(['brandId', 'category'])
export class OptimizationSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  brandId: string;

  @Column({ nullable: true })
  diagnosisReportId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: SuggestionCategory,
    default: SuggestionCategory.CONTENT,
  })
  category: SuggestionCategory;

  @Column({
    type: 'simple-enum',
    enum: SuggestionPriority,
    default: SuggestionPriority.MEDIUM,
  })
  priority: SuggestionPriority;

  @Column({
    type: 'simple-enum',
    enum: SuggestionStatus,
    default: SuggestionStatus.PENDING,
  })
  status: SuggestionStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'text', nullable: true })
  actionPlan: string;

  @Column({ type: 'text', nullable: true })
  expectedOutcome: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'float', nullable: true })
  estimatedImpact: number;

  @Column({ nullable: true })
  executedBy: string;

  @Column({ type: 'datetime', nullable: true })
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
