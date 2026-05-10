"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';

/**
 * 用户状态
 */
export enum UserStatus {
  ACTIVE = 'active',           // 正常
  SUSPENDED = 'suspended',     // 停用
  PENDING = 'pending',         // 待验证
  DELETED = 'deleted',          // 已删除
}

/**
 * 用户实体 - 支持多租户
 */
@Entity('users')
@Index(['organizationId', 'status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 20, default: UserStatus.PENDING })
  status: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  brandId: string;

  @Column({ type: 'uuid' })
  roleId: string;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  // 品牌知识库角色关联 (在 auth 模块中定义)
  // 注意：这里使用字符串引用避免循环依赖
  // @OneToMany(() => UserRole, userRole => userRole.user)
  // userRoles: UserRole[];

  @Column({ type: 'json', default: '{}' })
  profile: Record<string, any>;  // 扩展信息

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastLoginIp: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string;

  @Column({ type: 'datetime', nullable: true })
  passwordResetExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  /**
   * 检查用户是否活跃
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否有权限
   */
  hasPermission(permission: string): boolean {
    if (!this.role) return false;
    return this.role.hasPermission(permission);
  }
}
