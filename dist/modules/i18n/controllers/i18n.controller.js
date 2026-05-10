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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const i18n_service_1 = require("../services/i18n.service");
const i18n_dto_1 = require("../dto/i18n.dto");
let I18nController = class I18nController {
    constructor(i18nService) {
        this.i18nService = i18nService;
    }
    async getLocales() {
        const locales = this.i18nService.getSupportedLocales();
        return { data: locales };
    }
    async getTranslations(locale, namespace) {
        const translations = await this.i18nService.getTranslations(locale, namespace);
        return { data: translations };
    }
    async translate(dto) {
        const translation = await this.i18nService.t(dto.key, dto.params, dto.locale);
        return { data: { key: dto.key, translation } };
    }
    async setLocale(dto, req) {
        this.i18nService.setLocale(dto.locale);
        return { success: true, locale: dto.locale };
    }
};
exports.I18nController = I18nController;
__decorate([
    (0, common_1.Get)('locales'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], I18nController.prototype, "getLocales", null);
__decorate([
    (0, common_1.Get)(':locale'),
    __param(0, (0, common_1.Param)('locale')),
    __param(1, (0, common_1.Query)('ns')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], I18nController.prototype, "getTranslations", null);
__decorate([
    (0, common_1.Post)('translate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [i18n_dto_1.TranslateDto]),
    __metadata("design:returntype", Promise)
], I18nController.prototype, "translate", null);
__decorate([
    (0, common_1.Post)('set-locale'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [i18n_dto_1.SetLocaleDto, Object]),
    __metadata("design:returntype", Promise)
], I18nController.prototype, "setLocale", null);
exports.I18nController = I18nController = __decorate([
    (0, common_1.Controller)('v1/i18n'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [i18n_service_1.I18nService])
], I18nController);
//# sourceMappingURL=i18n.controller.js.map