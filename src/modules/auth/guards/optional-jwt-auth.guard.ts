import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 如果没有 Authorization header，允许继续（但不设置 user）
    if (!authHeader) {
      return true;
    }

    // 如果有 Authorization header，验证 token
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      // 有 header 但格式不对，也允许继续
      return true;
    }

    try {
      const user = await this.authService.validateToken(token);
      request.user = user;
    } catch (error) {
      // 验证失败也允许继续（只是没有 user）
      // 如果需要强制认证，应该使用 JwtAuthGuard
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
