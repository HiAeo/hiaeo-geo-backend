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

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ExecutionPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('optimization_executions')
@Index(['brandId', 'status'])
@Index(['suggestionId'])
export class OptimizationExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  brandId: string;

  @Column()
  suggestionId: string;

  @Column({
    type: 'simple-enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @Column({
    type: 'simple-enum',
    enum: ExecutionPriority,
    default: ExecutionPriority.MEDIUM,
  })
  priority: ExecutionPriority;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ type: 'json', nullable: true })
  metrics: {
    traffic?: number;
    ranking?: number;
    coverage?: number;
    authority?: number;
    suppression?: number;
    beforeScore?: number;
    afterScore?: number;
  };

  @Column({ type: 'float', default: 0 })
  effectScore: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  executedBy: string;

  @Column({ type: 'datetime', nullable: true })
  executedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'json', nullable: true })
  errorLog: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
