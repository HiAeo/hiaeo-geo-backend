"use strict";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * API使用日志 - T122
 */
@Entity('api_usage_logs')
@Index(['apiKeyId', 'createdAt'])
@Index(['organizationId', 'createdAt'])
@Index(['endpoint', 'createdAt'])
export class ApiUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  apiKeyId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  endpoint: string;  // API端点

  @Column({ type: 'varchar', length: 20 })
  method: string;  // HTTP方法

  @Column({ type: 'int' })
  statusCode: number;  // 响应状态码

  @Column({ type: 'int', default: 0 })
  responseTime: number;  // 响应时间(ms)

  @Column({ type: 'int', default: 0 })
  requestSize: number;  // 请求大小(bytes)

  @Column({ type: 'int', default: 0 })
  responseSize: number;  // 响应大小(bytes)

  @Column({ type: 'varchar', length: 50 })
  ip: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  requestBody: Record<string, any>;  // 请求体(脱敏)

  @Column({ type: 'json', nullable: true })
  responseBody: Record<string, any>;  // 响应体(脱敏)

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  /**
   * 是否成功请求
   */
  isSuccess(): boolean {
    return this.statusCode >= 200 && this.statusCode < 400;
  }
}
