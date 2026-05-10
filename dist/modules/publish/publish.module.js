"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const publish_controller_1 = require("./controllers/publish.controller");
const publish_service_1 = require("./services/publish.service");
const platform_config_service_1 = require("./platforms/platform-config.service");
const entities_1 = require("../content/entities");
const auth_module_1 = require("../auth/auth.module");
let PublishModule = class PublishModule {
};
exports.PublishModule = PublishModule;
exports.PublishModule = PublishModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.PublishRecord]),
            auth_module_1.AuthModule,
        ],
        controllers: [publish_controller_1.PublishController],
        providers: [publish_service_1.PublishService, platform_config_service_1.PlatformConfigService],
        exports: [publish_service_1.PublishService, platform_config_service_1.PlatformConfigService],
    })
], PublishModule);
//# sourceMappingURL=publish.module.js.map