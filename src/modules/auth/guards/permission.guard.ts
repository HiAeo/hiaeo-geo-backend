import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../services/permission.service';
import { PERMISSION_KEY, KNOWLEDGE_ACCESS_KEY } from '../decorators/permission.decorator';
import { PERMISSIONS } from '../constants/permissions.constant';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requireKnowledgeAccess = this.reflector.getAllAndOverride<boolean>(
      KNOWLEDGE_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有配置权限要求，直接通过
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('用户未认证');
    }

    const userId = user.id;

    // 获取资源ID（知识库ID）
    const resourceId = request.params.knowledgeId ||
      request.params.id ||
      request.body?.knowledgeId ||
      request.query?.knowledgeId;

    // 如果需要知识库访问控制
    if (requireKnowledgeAccess) {
      if (!resourceId) {
        throw new ForbiddenException('缺少知识库ID参数');
      }

      const hasAccess = await this.permissionService.checkKnowledgeAccess(
        userId,
        resourceId,
      );

      if (!hasAccess) {
        throw new ForbiddenException('无权访问该知识库');
      }
    }

    // 检查每个必需权限
    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionService.checkPermission(
        userId,
        permission,
        resourceId,
      );

      if (!hasPermission) {
        this.logger.warn(`用户 ${userId} 缺少权限: ${permission}`);
        throw new ForbiddenException(`缺少必需权限: ${permission}`);
      }
    }

    return true;
  }
}
