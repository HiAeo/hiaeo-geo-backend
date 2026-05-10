import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageController } from './controllers/package.controller';
import { PackageAdminController } from './controllers/package-admin.controller';
import { PackageService } from './services/package.service';
import { PackageAdminService } from './services/package-admin.service';
import { Package } from './entities/package.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Package, User, Role])],
  controllers: [PackageController, PackageAdminController],
  providers: [PackageService, PackageAdminService],
  exports: [PackageService, PackageAdminService],
})
export class PackageModule {}
