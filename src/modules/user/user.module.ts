"use strict";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Role, Organization, AuditLog } from './entities';
import { UserService, OrganizationService, AuditService } from './services';
import { UserController } from './controllers/user.controller';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Organization, AuditLog])],
  controllers: [UserController],
  providers: [
    UserService,
    OrganizationService,
    AuditService,
    PermissionGuard,
  ],
  exports: [
    UserService,
    OrganizationService,
    AuditService,
    PermissionGuard,
  ],
})
export class UserModule {}
