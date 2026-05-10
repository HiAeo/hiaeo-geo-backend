export declare const PERMISSION_KEY = "permissions";
export declare const KNOWLEDGE_ACCESS_KEY = "knowledge_access";
export declare const RequirePermission: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequirePermissions: (permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const KnowledgeAccess: () => import("@nestjs/common").CustomDecorator<string>;
