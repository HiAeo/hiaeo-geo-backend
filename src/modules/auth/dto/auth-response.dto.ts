import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  organizationId: string;

  static fromUser(user: User): UserInfoDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role?.code || '',
      organizationId: user.organizationId,
    };
  }
}

export class AuthResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;

  @ApiProperty({ description: '令牌类型' })
  tokenType: string;

  @ApiProperty({ description: '过期时间（秒）' })
  expiresIn: number;

  @ApiProperty({ description: '用户信息' })
  user: UserInfoDto;
}

export class TokenPayloadDto {
  @ApiProperty()
  sub: string;      // 用户ID

  @ApiProperty()
  email: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  type: string;      // token 类型: access 或 refresh

  @ApiProperty()
  iat: number;      // 签发时间

  @ApiProperty()
  exp: number;       // 过期时间
}
