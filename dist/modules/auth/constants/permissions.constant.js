"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE_PERMISSIONS = exports.SYSTEM_ROLES = exports.PERMISSION_MODULES = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = {
    KNOWLEDGE_READ: 'knowledge:read',
    KNOWLEDGE_WRITE: 'knowledge:write',
    KNOWLEDGE_DELETE: 'knowledge:delete',
    KNOWLEDGE_AUDIT: 'knowledge:audit',
    WORKFLOW_READ: 'workflow:read',
    WORKFLOW_WRITE: 'workflow:write',
    WORKFLOW_EXECUTE: 'workflow:execute',
    CONTENT_READ: 'content:read',
    CONTENT_WRITE: 'content:write',
    USER_MANAGE: 'user:manage',
    ROLE_MANAGE: 'role:manage',
    AUDIT_VIEW: 'audit:view',
    BRAND_READ: 'brand:read',
    BRAND_WRITE: 'brand:write',
    STRATEGY_READ: 'strategy:read',
    STRATEGY_WRITE: 'strategy:write',
    PUBLISH_READ: 'publish:read',
    PUBLISH_EXECUTE: 'publish:execute',
};
exports.PERMISSION_MODULES = {
    KNOWLEDGE: 'KNOWLEDGE',
    WORKFLOW: 'WORKFLOW',
    CONTENT: 'CONTENT',
    USER: 'USER',
    ROLE: 'ROLE',
    AUDIT: 'AUDIT',
    BRAND: 'BRAND',
    STRATEGY: 'STRATEGY',
    PUBLISH: 'PUBLISH',
};
exports.SYSTEM_ROLES = {
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    VIEWER: 'VIEWER',
    GUEST: 'GUEST',
};
exports.DEFAULT_ROLE_PERMISSIONS = {
    [exports.SYSTEM_ROLES.ADMIN]: Object.values(exports.PERMISSIONS),
    [exports.SYSTEM_ROLES.EDITOR]: [
        exports.PERMISSIONS.KNOWLEDGE_READ,
        exports.PERMISSIONS.KNOWLEDGE_WRITE,
        exports.PERMISSIONS.CONTENT_READ,
        exports.PERMISSIONS.CONTENT_WRITE,
        exports.PERMISSIONS.WORKFLOW_READ,
        exports.PERMISSIONS.WORKFLOW_EXECUTE,
    ],
    [exports.SYSTEM_ROLES.VIEWER]: [
        exports.PERMISSIONS.KNOWLEDGE_READ,
        exports.PERMISSIONS.CONTENT_READ,
        exports.PERMISSIONS.WORKFLOW_READ,
    ],
    [exports.SYSTEM_ROLES.GUEST]: [
        exports.PERMISSIONS.KNOWLEDGE_READ,
        exports.PERMISSIONS.CONTENT_READ,
    ],
};
//# sourceMappingURL=permissions.constant.js.map