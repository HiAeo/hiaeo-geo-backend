import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * 团队成员角色
 */
export enum TeamRole {
  OWNER = 'owner',       // 所有者
  ADMIN = 'admin',       // 管理员
  MEMBER = 'member',     // 成员
  VIEWER = 'viewer',     // 查看者
}

/**
 * 团队成员状态
 */
export enum TeamMemberStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

/**
 * 团队成员实体
 */
@Entity('team_members')
@Index(['organizationId'])
@Index(['userId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: TeamRole,
    default: TeamRole.MEMBER,
  })
  role: TeamRole;

  @Column({
    name: 'invited_by'
  })
  invitedBy: string;

  @Column({
    type: 'simple-enum',
    enum: TeamMemberStatus,
    default: TeamMemberStatus.PENDING,
  })
  status: TeamMemberStatus;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true, name: 'accepted_at' })
  acceptedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * 是否可以管理其他成员
   */
  canManageMembers(): boolean {
    return this.role === TeamRole.OWNER || this.role === TeamRole.ADMIN;
  }

  /**
   * 是否可以修改组织设置
   */
  canModifyOrganization(): boolean {
    return this.role === TeamRole.OWNER || this.role === TeamRole.ADMIN;
  }

  /**
   * 是否有计费权限
   */
  canManageBilling(): boolean {
    return this.role === TeamRole.OWNER;
  }
}
