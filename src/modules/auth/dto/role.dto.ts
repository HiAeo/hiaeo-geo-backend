import { IsString, IsArray, IsOptional, IsBoolean, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建角色 DTO
 */
export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: 'EDITOR' })
  @IsString()
  @MinLength(2, { message: '角色名称至少2个字符' })
  @MaxLength(50, { message: '角色名称最多50个字符' })
  name: string;

  @ApiProperty({ description: '角色描述', example: '内容编辑角色' })
  @IsString()
  @MaxLength(100, { message: '角色描述最多100个字符' })
  description: string;

  @ApiPropertyOptional({ description: '权限列表', example: ['knowledge:read', 'knowledge:write'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: '是否为系统内置角色', default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: '角色级别', default: 0 })
  @IsOptional()
  @IsBoolean()
  level?: number;
}

/**
 * 更新角色 DTO
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '角色描述' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @ApiPropertyOptional({ description: '权限列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: '是否激活' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '角色级别' })
  @IsOptional()
  level?: number;
}

/**
 * 分配角色 DTO
 */
export class AssignRoleDto {
  @ApiProperty({ description: '角色ID' })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({ description: '知识库访问范围（ID列表）', example: ['uuid1', 'uuid2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knowledgeScope?: string[];

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  expiresAt?: Date;
}

/**
 * 设置知识库范围 DTO
 */
export class SetKnowledgeScopeDto {
  @ApiProperty({ description: '角色ID' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ description: '知识库ID列表', example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsString({ each: true })
  knowledgeIds: string[];
}

/**
 * 检查权限 DTO
 */
export class CheckPermissionDto {
  @ApiProperty({ description: '要检查的权限', example: 'knowledge:read' })
  @IsString()
  permission: string;

  @ApiPropertyOptional({ description: '资源ID（用于知识库级别的权限检查）' })
  @IsOptional()
  @IsString()
  resourceId?: string;
}
