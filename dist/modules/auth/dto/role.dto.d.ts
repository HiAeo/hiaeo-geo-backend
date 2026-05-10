export declare class CreateRoleDto {
    name: string;
    description: string;
    permissions?: string[];
    isSystem?: boolean;
    level?: number;
}
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
    level?: number;
}
export declare class AssignRoleDto {
    roleId: string;
    knowledgeScope?: string[];
    expiresAt?: Date;
}
export declare class SetKnowledgeScopeDto {
    roleId: string;
    knowledgeIds: string[];
}
export declare class CheckPermissionDto {
    permission: string;
    resourceId?: string;
}
