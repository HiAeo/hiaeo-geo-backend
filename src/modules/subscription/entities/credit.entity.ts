import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TransactionType {
  EARN = 'earn',
  CONSUME = 'consume',
  REFUND = 'refund',
  BONUS = 'bonus',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SourceType {
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
  REFERRAL = 'referral',
  BONUS = 'bonus',
  DAILY = 'daily',
  DIAGNOSTIC = 'diagnostic',
  CONTENT_GENERATION = 'content_generation',
}

@Entity('credits')
export class Credit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'balance', type: 'int', default: 0 })
  balance: number;

  @Column({ name: 'total_earned', type: 'int', default: 0 })
  totalEarned: number;

  @Column({ name: 'total_consumed', type: 'int', default: 0 })
  totalConsumed: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('credit_transactions')
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: TransactionType,
    default: TransactionType.EARN,
  })
  type: TransactionType;

  @Column({
    name: 'source_type',
    type: 'simple-enum',
    enum: SourceType,
  })
  sourceType: SourceType;

  @Column({ type: 'int' })
  amount: number;

  @Column({
    type: 'simple-enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ name: 'balance_before', type: 'int', nullable: true })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'int', nullable: true })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'related_order_id', nullable: true })
  relatedOrderId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
