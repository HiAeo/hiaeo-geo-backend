import { Repository } from 'typeorm';
import { Invitation } from '../entities/invitation.entity';
import { CreditService } from '../../subscription/services/credit.service';
export declare class InvitationService {
    private invitationRepository;
    private creditService;
    constructor(invitationRepository: Repository<Invitation>, creditService: CreditService);
    generateInvitationCode(userId: string): Promise<Invitation>;
    getUserInvitationCode(userId: string): Promise<Invitation>;
    getInvitationByCode(code: string): Promise<Invitation>;
    useInvitationCode(code: string, inviteeId: string): Promise<Invitation>;
    completeInvitation(orderId: string, inviteeId: string): Promise<Invitation | null>;
    getInvitationStats(userId: string): Promise<{
        totalInvitations: number;
        completedInvitations: number;
        pendingInvitations: number;
        totalRewards: number;
        invitationCode: string | null;
    }>;
    getInvitations(userId: string, page?: number, limit?: number): Promise<{
        invitations: Invitation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private generateUniqueCode;
}
