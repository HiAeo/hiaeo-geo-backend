"use strict";
import { IsEmail, IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';
import { RoleType } from '../entities/role.entity';

/**
 * 创建用户DTO
 */
export class CreateUserDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2, { message: '姓名至少2个字符' })
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsEnum(RoleType, { message: '无效的角色类型' })
  roleCode: RoleType;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  profile?: Record<string, any>;
}

/**
 * 更新用户DTO
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(RoleType)
  roleCode?: RoleType;

  @IsOptional()
  profile?: Record<string, any>;
}

/**
 * 更新密码DTO
 */
export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string;
}

/**
 * 重置密码DTO
 */
export class ResetPasswordDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string;
}
