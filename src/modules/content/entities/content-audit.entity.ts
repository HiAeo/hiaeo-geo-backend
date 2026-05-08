import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('content_audits')
export class ContentAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'content_id' })
  contentId: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  changes: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
