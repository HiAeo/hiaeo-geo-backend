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
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
let ConfigService = class ConfigService {
    constructor() {
        this.env = process.env;
    }
    get(key, defaultValue) {
        return this.env[key] || defaultValue || '';
    }
    getNumber(key, defaultValue) {
        const value = this.env[key];
        return value ? parseInt(value, 10) : defaultValue || 0;
    }
    getBoolean(key, defaultValue) {
        const value = this.env[key];
        if (value === undefined)
            return defaultValue || false;
        return value === 'true' || value === '1';
    }
    isProduction() {
        return this.get('NODE_ENV') === 'production';
    }
    isDevelopment() {
        return this.get('NODE_ENV') === 'development';
    }
    getDeepseekApiKey() {
        return this.get('DEEPSEEK_API_KEY');
    }
    getKimiApiKey() {
        return this.get('KIMI_API_KEY');
    }
    getQwenApiKey() {
        return this.get('QWEN_API_KEY');
    }
    getZhipuApiKey() {
        return this.get('ZHIPU_API_KEY');
    }
    getDoubaoApiKey() {
        return this.get('DOUBAO_API_KEY');
    }
    getWenxinApiKey() {
        return this.get('WENXIN_API_KEY');
    }
    getWenxinSecretKey() {
        return this.get('WENXIN_SECRET_KEY');
    }
    getDefaultAiEngine() {
        return this.get('DEFAULT_AI_ENGINE', 'deepseek');
    }
    getPort() {
        return this.getNumber('PORT', 3000);
    }
    getJwtSecret() {
        return this.get('JWT_SECRET', 'default-secret-change-in-production');
    }
    getJwtExpiration() {
        return this.get('JWT_EXPIRATION', '7d');
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ConfigService);
//# sourceMappingURL=config.service.js.map