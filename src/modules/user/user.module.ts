import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { OrganizationService } from './services/organization.service';
import { AuditService } from './services/audit.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Organization } from './entities/organization.entity';
import { AuditLog } from './entities/audit-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Organization, AuditLog])],
  controllers: [UserController],
  providers: [UserService, OrganizationService, AuditService],
  exports: [UserService, OrganizationService, AuditService],
})
export class UserModule {}
