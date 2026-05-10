"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_service_1 = require("../config.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: (configService) => {
                    const dbType = configService.get('DB_TYPE', 'sqlite');
                    const baseConfig = {
                        type: dbType,
                        synchronize: true,
                        logging: configService.getBoolean('DB_LOGGING', false),
                        autoLoadEntities: true,
                    };
                    switch (dbType) {
                        case 'mysql':
                        case 'mariadb':
                            return {
                                ...baseConfig,
                                host: configService.get('DB_HOST', 'localhost'),
                                port: configService.getNumber('DB_PORT', 3306),
                                username: configService.get('DB_USERNAME', 'root'),
                                password: configService.get('DB_PASSWORD', ''),
                                database: configService.get('DB_DATABASE', 'hiaeo'),
                                extra: {
                                    connectionLimit: 10,
                                },
                            };
                        case 'postgres':
                        case 'postgresql':
                            return {
                                ...baseConfig,
                                host: configService.get('DB_HOST', 'localhost'),
                                port: configService.getNumber('DB_PORT', 5432),
                                username: configService.get('DB_USERNAME', 'postgres'),
                                password: configService.get('DB_PASSWORD', ''),
                                database: configService.get('DB_DATABASE', 'hiaeo'),
                                schema: configService.get('DB_SCHEMA', 'public'),
                            };
                        case 'sqlite':
                        default:
                            return {
                                ...baseConfig,
                                database: configService.get('DB_DATABASE', './database/hiaeo.db'),
                            };
                    }
                },
                inject: [config_service_1.ConfigService],
            }),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map