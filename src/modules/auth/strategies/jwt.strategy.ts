import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../../config/config.service';
import { UserService } from '../../user/services/user.service';
import { TokenPayloadDto } from '../dto/auth-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtSecret(),
    });
  }

  async validate(payload: TokenPayloadDto) {
    // 检查是否是访问令牌
    if (payload.type !== 'access') {
      throw new UnauthorizedException('无效的访问令牌');
    }

    // 获取用户信息
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 返回用户对象，附加到 request.user
    return user;
  }
}
