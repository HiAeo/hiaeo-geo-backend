import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';
export const KNOWLEDGE_ACCESS_KEY = 'knowledge_access';

/**
 * 要求单个权限
 * @param permission 权限代码，如 'knowledge:read'
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

/**
 * 要求多个权限（全部满足）
 * @param permissions 权限代码数组
 */
export const RequirePermissions = (permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

/**
 * 知识库级别的访问控制
 * 需要在请求中提供 knowledgeId 参数
 */
export const KnowledgeAccess = () => SetMetadata(KNOWLEDGE_ACCESS_KEY, true);
