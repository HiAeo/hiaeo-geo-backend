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
 * 企业汇款状态
 */
export enum TransferStatus {
  PENDING = 'pending',           // 待处理
  VERIFYING = 'verifying',       // 审核中
  CONFIRMED = 'confirmed',       // 已确认
  REJECTED = 'rejected',         // 已拒绝
  CANCELLED = 'cancelled',       // 已取消
}

/**
 * 企业对公汇款实体 - T133
 */
@Entity('enterprise_transfers')
@Index(['organizationId', 'status'])
@Index(['transferNo'])
export class EnterpriseTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transferNo: string;  // 汇款单号

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  status: TransferStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;  // 汇款金额

  // 汇款方信息
  @Column({ type: 'varchar', length: 255 })
  payerName: string;  // 汇款方名称

  @Column({ type: 'varchar', length: 50 })
  payerAccount: string;  // 汇款方账号

  @Column({ type: 'varchar', length: 100 })
  payerBank: string;  // 汇款方开户行

  // 收款方信息（固定）
  @Column({ type: 'varchar', length: 255, default: '杭州魔鲸科技有限公司' })
  payeeName: string;

  @Column({ type: 'varchar', length: 50, default: '91330100MA2HXXXXXR' })
  payeeTaxNo: string;

  @Column({ type: 'varchar', length: 100 })
  payeeBank: string;  // 收款方开户行

  @Column({ type: 'varchar', length: 50 })
  payeeAccount: string;  // 收款方账号

  // 汇款凭证
  @Column({ type: 'varchar', length: 255, nullable: true })
  voucherUrl: string;  // 凭证图片URL

  @Column({ type: 'varchar', length: 50, nullable: true })
  transferTime: string;  // 汇款时间

  @Column({ type: 'varchar', length: 50, nullable: true })
  serialNo: string;  // 银行流水号

  // 审核信息
  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  verifiedStatus: TransferStatus;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  verifyRemarks: string;  // 审核备注

  // 关联充值
  @Column({ type: 'uuid', nullable: true })
  rechargeId: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;  // 备注

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid' })
  createdBy: string;
}
