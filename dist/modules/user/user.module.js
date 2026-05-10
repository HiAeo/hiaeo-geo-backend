"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_controller_1 = require("./controllers/user.controller");
const user_service_1 = require("./services/user.service");
const organization_service_1 = require("./services/organization.service");
const audit_service_1 = require("./services/audit.service");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const organization_entity_1 = require("./entities/organization.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role, organization_entity_1.Organization, audit_log_entity_1.AuditLog])],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService, organization_service_1.OrganizationService, audit_service_1.AuditService],
        exports: [user_service_1.UserService, organization_service_1.OrganizationService, audit_service_1.AuditService],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map