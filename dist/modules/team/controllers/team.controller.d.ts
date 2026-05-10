import { TeamService } from '../services/team.service';
import { TeamRole } from '../entities/team-member.entity';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    getMembers(organizationId: string, userId: string): Promise<import("../entities/team-member.entity").TeamMember[] | {
        message: string;
        members: never[];
    }>;
    addMember(organizationId: string, userId: string, body: {
        targetUserId: string;
        role: TeamRole;
    }): Promise<import("../entities/team-member.entity").TeamMember | {
        message: string;
    }>;
    removeMember(organizationId: string, targetUserId: string, userId: string): Promise<{
        message: string;
        success?: undefined;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    updateMemberRole(organizationId: string, targetUserId: string, userId: string, role: TeamRole): Promise<import("../entities/team-member.entity").TeamMember | {
        message: string;
    }>;
    getMemberRole(organizationId: string, targetUserId: string, userId: string): Promise<{
        role: TeamRole | null;
    }>;
}
