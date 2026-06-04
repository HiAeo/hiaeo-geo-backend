/**
 * 权限常量定义
 * 定义系统中所有的权限代码
 */
export const PERMISSIONS = {
  // 知识库权限
  KNOWLEDGE_READ: 'knowledge:read',
  KNOWLEDGE_WRITE: 'knowledge:write',
  KNOWLEDGE_DELETE: 'knowledge:delete',
  KNOWLEDGE_AUDIT: 'knowledge:audit',
  
  // 工作流权限
  WORKFLOW_READ: 'workflow:read',
  WORKFLOW_WRITE: 'workflow:write',
  WORKFLOW_EXECUTE: 'workflow:execute',
  
  // 内容权限
  CONTENT_READ: 'content:read',
  CONTENT_WRITE: 'content:write',
  
  // 系统权限
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  AUDIT_VIEW: 'audit:view',
  
  // 品牌权限
  BRAND_READ: 'brand:read',
  BRAND_WRITE: 'brand:write',
  
  // 策略权限
  STRATEGY_READ: 'strategy:read',
  STRATEGY_WRITE: 'strategy:write',
  
  // 发布权限
  PUBLISH_READ: 'publish:read',
  PUBLISH_EXECUTE: 'publish:execute',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * 权限模块
 */
export const PERMISSION_MODULES = {
  KNOWLEDGE: 'KNOWLEDGE',
  WORKFLOW: 'WORKFLOW',
  CONTENT: 'CONTENT',
  USER: 'USER',
  ROLE: 'ROLE',
  AUDIT: 'AUDIT',
  BRAND: 'BRAND',
  STRATEGY: 'STRATEGY',
  PUBLISH: 'PUBLISH',
} as const;

export type PermissionModule = typeof PERMISSION_MODULES[keyof typeof PERMISSION_MODULES];

/**
 * 系统角色定义
 */
export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  GUEST: 'GUEST',
} as const;

export type SystemRoleCode = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

/**
 * 系统角色的默认权限
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRoleCode, PermissionCode[]> = {
  [SYSTEM_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [SYSTEM_ROLES.EDITOR]: [
    PERMISSIONS.KNOWLEDGE_READ,
    PERMISSIONS.KNOWLEDGE_WRITE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.WORKFLOW_EXECUTE,
  ],
  [SYSTEM_ROLES.VIEWER]: [
    PERMISSIONS.KNOWLEDGE_READ,
    PERMISSIONS.KNOWLEDGE_WRITE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.WORKFLOW_READ,
  ],
  [SYSTEM_ROLES.GUEST]: [
    PERMISSIONS.KNOWLEDGE_READ,
    PERMISSIONS.CONTENT_READ,
  ],
};
