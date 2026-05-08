import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum DiagnosisStatus {
  PENDING = 'pending',         // 待处理
  RUNNING = 'running',         // 执行中
  COMPLETED = 'completed',     // 已完成
  FAILED = 'failed',           // 失败
  CANCELLED = 'cancelled',     // 已取消
}

export enum DiagnosisType {
  FULL = 'full',               // 完整诊断
  QUICK = 'quick',              // 快速诊断
  COMPETITOR = 'competitor',    // 竞品对比
  TRACKING = 'tracking',        // 效果追踪
}

@Entity('diagnosis_tasks')
export class DiagnosisTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'brand_name' })
  brandName: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'industry', nullable: true })
  industry: string;

  @Column({ name: 'target_market', nullable: true })
  targetMarket: string;

  @Column({
    type: 'enum',
    enum: DiagnosisType,
    default: DiagnosisType.FULL,
  })
  type: DiagnosisType;

  @Column({
    type: 'enum',
    enum: DiagnosisStatus,
    default: DiagnosisStatus.PENDING,
  })
  status: DiagnosisStatus;

  @Column({ name: 'ai_engine', nullable: true })
  aiEngine: string;

  @Column({ name: 'progress', default: 0 })
  progress: number;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ name: 'report_id', nullable: true })
  reportId: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
