import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole } from './user-role.entity';

/**
 * 品牌知识库角色实体
 * 支持 ADMIN, EDITOR, VIEWER, GUEST 四种角色
 */
@Entity('brand_roles')
export class BrandRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'json', default: '[]' })
  permissions: string[];

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  /**
   * 检查是否拥有指定权限
   */
  hasPermission(permission: string): boolean {
    if (this.permissions.includes('*')) return true;
    if (this.permissions.includes(permission)) return true;
    const [resource] = permission.split(':');
    if (this.permissions.includes(`${resource}:*`)) return true;
    return false;
  }
}
