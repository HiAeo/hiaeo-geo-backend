"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 角色枚举
 */
export enum RoleType {
  SUPER_ADMIN = 'super_admin',       // 超级管理员 - 全局管理
  ORG_ADMIN = 'org_admin',           // 组织管理员 - 企业管理
  BRAND_ADMIN = 'brand_admin',       // 品牌管理员 - 品牌管理
  EDITOR = 'editor',                 // 内容编辑 - 内容操作
  VIEWER = 'viewer',                 // 查看者 - 只读权限
}

/**
 * 角色权限映射
 */
export const RolePermissions = {
  [RoleType.SUPER_ADMIN]: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'org:create', 'org:read', 'org:update', 'org:delete',
    'brand:create', 'brand:read', 'brand:update', 'brand:delete',
    'subscription:*', 'content:*', 'strategy:*', 'publish:*',
    'audit:read', 'settings:*',
  ],
  [RoleType.ORG_ADMIN]: [
    'user:create', 'user:read', 'user:update',
    'brand:create', 'brand:read', 'brand:update', 'brand:delete',
    'subscription:read', 'subscription:update',
    'content:*', 'strategy:*', 'publish:*',
    'audit:read',
  ],
  [RoleType.BRAND_ADMIN]: [
    'user:read', 'user:update',
    'brand:read', 'brand:update',
    'subscription:read', 'subscription:update',
    'content:*', 'strategy:*', 'publish:*',
  ],
  [RoleType.EDITOR]: [
    'brand:read',
    'content:create', 'content:read', 'content:update',
    'strategy:create', 'strategy:read', 'strategy:update',
    'publish:read', 'publish:execute',
  ],
  [RoleType.VIEWER]: [
    'brand:read',
    'content:read',
    'strategy:read',
    'publish:read',
  ],
};

/**
 * 角色实体
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: RoleType;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', default: '[]' })
  permissions: string[];

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, user => user.role)
  users: User[];

  hasPermission(permission: string): boolean {
    if (this.permissions.includes('*')) return true;
    if (this.permissions.includes(permission)) return true;
    const [resource] = permission.split(':');
    if (this.permissions.includes(`${resource}:*`)) return true;
    return false;
  }

  static getRoleDescription(code: RoleType): string {
    const descriptions = {
      [RoleType.SUPER_ADMIN]: '超级管理员 - 拥有系统全部权限',
      [RoleType.ORG_ADMIN]: '组织管理员 - 管理企业内所有资源',
      [RoleType.BRAND_ADMIN]: '品牌管理员 - 管理单个品牌',
      [RoleType.EDITOR]: '内容编辑 - 创建和编辑内容',
      [RoleType.VIEWER]: '查看者 - 仅查看数据',
    };
    return descriptions[code] || '';
  }
}
