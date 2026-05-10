export declare enum TeamRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
    VIEWER = "viewer"
}
export declare enum TeamMemberStatus {
    ACTIVE = "active",
    PENDING = "pending",
    INACTIVE = "inactive"
}
export declare class TeamMember {
    id: string;
    organizationId: string;
    userId: string;
    role: TeamRole;
    invitedBy: string;
    status: TeamMemberStatus;
    permissions: string[];
    expiresAt: Date;
    acceptedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    canManageMembers(): boolean;
    canModifyOrganization(): boolean;
    canManageBilling(): boolean;
}
