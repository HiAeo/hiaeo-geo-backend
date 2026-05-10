import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from './entities/team-member.entity';
import { Organization } from '../user/entities/organization.entity';
import { TeamService } from './services/team.service';
import { TeamController } from './controllers/team.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamMember, Organization]),
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
