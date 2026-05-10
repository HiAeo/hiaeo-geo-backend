import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BrandRole } from './role.entity';

/**
 * 用户角色关联实体
 * 支持知识库级别的权限范围控制
 */
@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: false })
export class UserRole {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  roleId: string;

  @ManyToOne(() => BrandRole, role => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: BrandRole;

  /**
   * 知识库ID列表
   * 如果为空数组，表示可以访问所有知识库
   * 如果有值，只允许访问列表中的知识库
   */
  @Column({ type: 'json', default: '[]' })
  knowledgeScope: string[];

  /**
   * 角色过期时间
   * 如果设置，到期后自动失效
   */
  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  grantedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 检查角色是否已过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * 检查是否可以访问指定知识库
   */
  canAccessKnowledge(knowledgeId: string): boolean {
    // 如果没有设置范围，或者范围为空数组，表示可以访问所有知识库
    if (!this.knowledgeScope || this.knowledgeScope.length === 0) {
      return true;
    }
    return this.knowledgeScope.includes(knowledgeId);
  }
}
