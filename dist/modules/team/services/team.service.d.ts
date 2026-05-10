import { Repository } from 'typeorm';
import { TeamMember, TeamRole } from '../entities/team-member.entity';
import { Organization } from '../../user/entities/organization.entity';
export declare class TeamService {
    private teamMemberRepository;
    private organizationRepository;
    constructor(teamMemberRepository: Repository<TeamMember>, organizationRepository: Repository<Organization>);
    addMember(organizationId: string, userId: string, role: TeamRole, invitedBy: string): Promise<TeamMember>;
    removeMember(organizationId: string, targetUserId: string, operatorRole: TeamRole): Promise<void>;
    updateMemberRole(organizationId: string, targetUserId: string, newRole: TeamRole, operatorRole: TeamRole): Promise<TeamMember>;
    getMembers(organizationId: string): Promise<TeamMember[]>;
    getMemberRole(organizationId: string, userId: string): Promise<TeamRole | null>;
    isAdminOrOwner(organizationId: string, userId: string): Promise<boolean>;
    canManageBilling(organizationId: string, userId: string): Promise<boolean>;
}
