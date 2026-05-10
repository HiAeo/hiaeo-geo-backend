import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_no', unique: true })
  orderNo: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'package_id', nullable: true })
  packageId: string;

  @Column({ name: 'package_name' })
  packageName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'original_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount: number;

  @Column()
  status: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'payment_time', nullable: true })
  paymentTime: Date;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
