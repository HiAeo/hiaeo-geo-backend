import { BrandRole } from './role.entity';
export declare class UserRole {
    userId: string;
    roleId: string;
    role: BrandRole;
    knowledgeScope: string[];
    expiresAt: Date;
    grantedBy: string;
    createdAt: Date;
    updatedAt: Date;
    isExpired(): boolean;
    canAccessKnowledge(knowledgeId: string): boolean;
}
