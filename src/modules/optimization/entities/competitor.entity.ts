import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CompetitorStatus {
  TRACKING = 'tracking',
  SUPPRESSED = 'suppressed',
  LOST = 'lost',
  NEW = 'new',
}

export enum TrackingFrequency {
  HIGH = 'high',     // 每6小时
  NORMAL = 'normal', // 每天
  LOW = 'low',       // 每周
}

@Entity('competitors')
@Index(['brandName', 'competitorName'], { unique: true })
@Index(['brandName', 'isTracked'])
export class Competitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  brandName: string;

  @Column()
  competitorName: string;

  @Column({ nullable: true })
  competitorWebsite: string;

  @Column({ type: 'float', default: 50 })
  suppressionScore: number;

  @Column({ type: 'json', nullable: true })
  rankingData: {
    keywords?: Array<{ keyword: string; position: number; change: number }>;
    totalRanked?: number;
    avgPosition?: number;
  };

  @Column({ type: 'json', nullable: true })
  contentAnalysis: {
    articleCount?: number;
    avgLength?: number;
    lastPublished?: string;
    topics?: string[];
  };

  @Column({ type: 'boolean', default: false })
  isTracked: boolean;

  @Column({
    type: 'simple-enum',
    enum: CompetitorStatus,
    default: CompetitorStatus.NEW,
  })
  status: CompetitorStatus;

  @Column({
    type: 'simple-enum',
    enum: TrackingFrequency,
    default: TrackingFrequency.NORMAL,
  })
  trackingFrequency: TrackingFrequency;

  @Column({ type: 'json', nullable: true })
  suppressionStrategy: {
    targetKeywords?: string[];
    contentGaps?: string[];
    actionPlan?: string;
  };

  @Column({ type: 'int', default: 0 })
  trackingCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastTrackedAt: Date;

  @Column({ type: 'json', nullable: true })
  notifyChannels: string[];

  @Column({ type: 'json', nullable: true })
  history: Array<{
    date: Date;
    suppressionScore: number;
    rankingData?: any;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
