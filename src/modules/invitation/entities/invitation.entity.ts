import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum InvitationStatus {
  PENDING = 'pending',     // 被邀请人已注册但未付费
  COMPLETED = 'completed', // 被邀请人已付费，推荐人获得奖励
  EXPIRED = 'expired',     // 过期
  CANCELLED = 'cancelled', // 取消
}

@Entity('invitations')
@Index(['inviterId'])
@Index(['inviteeId'])
@Index(['code'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inviter_id' })
  inviterId: string;

  @Column({ name: 'invitee_id', nullable: true })
  inviteeId: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'simple-enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ name: 'reward_credits', type: 'int', default: 0 })
  rewardCredits: number;

  @Column({ name: 'reward_discount', type: 'real', default: 0 })
  rewardDiscount: number;

  @Column({ name: 'referral_order_id', nullable: true })
  referralOrderId: string;

  @Column({ name: 'invited_at', nullable: true })
  invitedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
