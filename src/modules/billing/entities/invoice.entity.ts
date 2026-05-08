"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 发票类型
 */
export enum InvoiceType {
  VAT_SPECIAL = 'vat_special',     // 增值税专用发票
  VAT_NORMAL = 'vat_normal',       // 增值税普通发票
  ELECTRONIC = 'electronic',       // 电子发票
  PLAIN = 'plain',                 // 通用机打发票
}

/**
 * 发票状态
 */
export enum InvoiceStatus {
  PENDING = 'pending',             // 待开
  PROCESSING = 'processing',      // 开票中
  ISSUED = 'issued',               // 已开具
  DELIVERED = 'delivered',         // 已送达
  CANCELLED = 'cancelled',         // 已作废
  REJECTED = 'rejected',           // 已驳回
}

/**
 * 发票实体 - T130
 */
@Entity('invoices')
@Index(['organizationId', 'status'])
@Index(['invoiceNo'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNo: string;  // 发票号

  @Column({ type: 'enum', enum: InvoiceType })
  type: InvoiceType;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;  // 发票金额

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;  // 税额

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;  // 总金额(含税)

  @Column({ type: 'varchar', length: 20 })
  taxRate: string;  // 税率

  // 购买方信息
  @Column({ type: 'varchar', length: 255 })
  buyerName: string;  // 购买方名称

  @Column({ type: 'varchar', length: 50 })
  buyerTaxNo: string;  // 购买方税号

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerAddress: string;  // 购买方地址

  @Column({ type: 'varchar', length: 30, nullable: true })
  buyerPhone: string;  // 购买方电话

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyerBank: string;  // 购买方开户行

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyerAccount: string;  // 购买方账号

  // 销售方信息
  @Column({ type: 'varchar', length: 255, default: '魔鲸科技有限公司' })
  sellerName: string;

  @Column({ type: 'varchar', length: 50 })
  sellerTaxNo: string;

  @Column({ type: 'varchar', length: 255 })
  sellerAddress: string;

  @Column({ type: 'varchar', length: 30 })
  sellerPhone: string;

  @Column({ type: 'varchar', length: 50 })
  sellerBank: string;

  @Column({ type: 'varchar', length: 50 })
  sellerAccount: string;

  // 发票内容
  @Column({ type: 'json' })
  items: {
    name: string;      // 商品名称
    specification: string;  // 规格型号
    unit: string;      // 单位
    quantity: number;  // 数量
    unitPrice: number; // 单价
    amount: number;    // 金额
    taxRate: string;   // 税率
    taxAmount: number; // 税额
  }[];

  @Column({ type: 'text', nullable: true })
  remarks: string;  // 备注

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;  // 接收邮箱

  // 开票信息
  @Column({ type: 'timestamp', nullable: true })
  issuedAt: Date;  // 开票时间

  @Column({ type: 'varchar', length: 100, nullable: true })
  issuedBy: string;  // 开票人

  @Column({ type: 'varchar', length: 255, nullable: true })
  downloadUrl: string;  // 下载链接

  // 关联订单
  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
