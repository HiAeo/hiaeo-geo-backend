import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

/**
 * 内容实体
 * 存储所有生成的内容
 */
@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  body: string;

  @Column({ name: 'content_type', length: 50 })
  contentType: string;

  @Column({ name: 'brand_id', length: 100, nullable: true })
  brandId: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column('json', { nullable: true })
  metadata: {
    keywords?: string[];
    metaTitle?: string;
    metaDescription?: string;
    wordCount?: number;
    readingTime?: number;
  };

  @Column({ length: 20, default: 'draft' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * 发布记录实体
 * 记录内容发布到各平台的状态
 */
@Entity('publish_records')
export class PublishRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_id', length: 100 })
  contentId: string;

  @ManyToOne(() => Content)
  @JoinColumn({ name: 'content_id' })
  content: Content;

  @Column({ name: 'brand_id', length: 100, nullable: true })
  brandId: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({ length: 50 })
  platform: string;

  @Column({ name: 'platform_content_id', length: 255, nullable: true })
  platformContentId: string;

  @Column({ name: 'platform_url', length: 500, nullable: true })
  platformUrl: string;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column('text', { nullable: true })
  message: string;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @Column({ name: 'scheduled_time', nullable: true })
  scheduledTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * 模豆策略实体
 * 存储生成的策略
 */
@Entity('mofa_strategies')
export class MofaStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'strategy_type', length: 50 })
  strategyType: string;

  @Column({ name: 'brand_id', length: 100, nullable: true })
  brandId: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column('text')
  content: string;

  @Column({ length: 20, default: 'draft' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * 内容审核记录实体
 */
@Entity('content_audits')
export class ContentAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_id', length: 100 })
  contentId: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({ length: 20 })
  action: string;

  @Column('json', { nullable: true })
  changes: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
