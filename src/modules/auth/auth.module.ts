import { Module, Global, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthPermissionController } from './controllers/auth-permission.controller';
import { AuthService } from './auth.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { UserRoleService } from './services/user-role.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import { Organization } from '../user/entities/organization.entity';
import { BrandRole } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { ConfigService } from '../../config/config.service';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getJwtSecret(),
        signOptions: {
          expiresIn: configService.getJwtExpiration() || '7d',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Organization,
      BrandRole,
      Permission,
      UserRole,
    ]),
  ],
  controllers: [AuthController, AuthPermissionController],
  providers: [
    AuthService,
    RoleService,
    PermissionService,
    UserRoleService,
    JwtStrategy,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PermissionGuard,
  ],
  exports: [
    AuthService,
    RoleService,
    PermissionService,
    UserRoleService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PermissionGuard,
    JwtModule,
    TypeOrmModule,
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly roleService: RoleService) {}

  async onModuleInit() {
    // 初始化系统角色
    await this.roleService.initDefaultRoles();
  }
}
