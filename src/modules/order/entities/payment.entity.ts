import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund',
  EXPIRED = 'expired',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'payment_no', unique: true })
  paymentNo: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  paidAmount: number;

  @Column({ name: 'refunded_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({ name: 'channel_transaction_id', nullable: true })
  channelTransactionId: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({ name: 'expire_at' })
  expireAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  channelResponse: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('refunds')
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'payment_id' })
  paymentId: string;

  @Column({ name: 'refund_no', unique: true })
  refundNo: string;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2 })
  refundAmount: number;

  @Column({ name: 'reason' })
  reason: string;

  @Column({ name: 'admin_id', nullable: true })
  adminId: string;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'channel_refund_id', nullable: true })
  channelRefundId: string;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
