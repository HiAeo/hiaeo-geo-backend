import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  @MaxLength(50, { message: '密码最多50个字符' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  @MaxLength(50, { message: '密码最多50个字符' })
  password: string;

  @ApiProperty({ description: '用户名', example: '张三' })
  @IsString()
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  name: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;
}

/** 手机号登录（小智聊天页专用） */
export class PhoneLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @Matches(/^1\d{10}$/, { message: '请输入正确的手机号' })
  phone: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;
}

/** 手机号注册（小智聊天页专用） */
export class PhoneRegisterDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @Matches(/^1\d{10}$/, { message: '请输入正确的手机号' })
  phone: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  @MaxLength(50, { message: '密码最多50个字符' })
  newPassword: string;
}
