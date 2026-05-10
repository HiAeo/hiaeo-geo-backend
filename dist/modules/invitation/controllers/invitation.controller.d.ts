import { InvitationService } from '../services/invitation.service';
export declare class InvitationController {
    private readonly invitationService;
    constructor(invitationService: InvitationService);
    getMyInvitationCode(userId: string): Promise<import("../entities/invitation.entity").Invitation>;
    generateInvitationCode(userId: string): Promise<import("../entities/invitation.entity").Invitation>;
    getInvitationStats(userId: string): Promise<{
        totalInvitations: number;
        completedInvitations: number;
        pendingInvitations: number;
        totalRewards: number;
        invitationCode: string | null;
    }>;
    getInvitations(userId: string, page?: string, limit?: string): Promise<{
        invitations: import("../entities/invitation.entity").Invitation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    useInvitationCode(userId: string, code: string): Promise<import("../entities/invitation.entity").Invitation>;
    validateInvitationCode(code: string): Promise<import("../entities/invitation.entity").Invitation>;
}
