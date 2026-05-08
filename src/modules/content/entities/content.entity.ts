import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  body: string;

  @Column({ length: 50, nullable: true })
  type: string;

  @Column({ length: 20, default: 'draft' })
  status: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
