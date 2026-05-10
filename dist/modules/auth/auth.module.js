"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./auth.controller");
const auth_permission_controller_1 = require("./controllers/auth-permission.controller");
const auth_service_1 = require("./auth.service");
const role_service_1 = require("./services/role.service");
const permission_service_1 = require("./services/permission.service");
const user_role_service_1 = require("./services/user-role.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("./guards/optional-jwt-auth.guard");
const permission_guard_1 = require("./guards/permission.guard");
const user_entity_1 = require("../user/entities/user.entity");
const role_entity_1 = require("../user/entities/role.entity");
const organization_entity_1 = require("../user/entities/organization.entity");
const role_entity_2 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
const config_service_1 = require("../../config/config.service");
let AuthModule = class AuthModule {
    constructor(roleService) {
        this.roleService = roleService;
    }
    async onModuleInit() {
        await this.roleService.initDefaultRoles();
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                useFactory: (configService) => ({
                    secret: configService.getJwtSecret(),
                    signOptions: {
                        expiresIn: configService.getJwtExpiration() || '7d',
                    },
                }),
                inject: [config_service_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                role_entity_1.Role,
                organization_entity_1.Organization,
                role_entity_2.BrandRole,
                permission_entity_1.Permission,
                user_role_entity_1.UserRole,
            ]),
        ],
        controllers: [auth_controller_1.AuthController, auth_permission_controller_1.AuthPermissionController],
        providers: [
            auth_service_1.AuthService,
            role_service_1.RoleService,
            permission_service_1.PermissionService,
            user_role_service_1.UserRoleService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            optional_jwt_auth_guard_1.OptionalJwtAuthGuard,
            permission_guard_1.PermissionGuard,
        ],
        exports: [
            auth_service_1.AuthService,
            role_service_1.RoleService,
            permission_service_1.PermissionService,
            user_role_service_1.UserRoleService,
            jwt_auth_guard_1.JwtAuthGuard,
            optional_jwt_auth_guard_1.OptionalJwtAuthGuard,
            permission_guard_1.PermissionGuard,
            jwt_1.JwtModule,
            typeorm_1.TypeOrmModule,
        ],
    }),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], AuthModule);
//# sourceMappingURL=auth.module.js.map