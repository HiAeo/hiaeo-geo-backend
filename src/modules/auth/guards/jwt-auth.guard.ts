import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    try {
      // 使用 AuthService 验证 token 并获取用户
      const user = await this.authService.validateToken(token);
      // 将用户信息附加到 request 对象
      request.user = user;
      return true;
    } catch (error) {
      if (error.message?.includes('令牌')) {
        throw error;
      }
      throw new UnauthorizedException('认证失败，请重新登录');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
