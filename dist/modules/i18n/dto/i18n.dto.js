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
exports.SetLocaleDto = exports.TranslateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TranslateDto {
}
exports.TranslateDto = TranslateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '翻译键，如 common.buttons.save' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TranslateDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '目标语言，默认 zh-CN' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TranslateDto.prototype, "locale", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '替换参数，如 { name: "John" }' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], TranslateDto.prototype, "params", void 0);
class SetLocaleDto {
}
exports.SetLocaleDto = SetLocaleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '语言代码，如 zh-CN 或 en-US' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetLocaleDto.prototype, "locale", void 0);
//# sourceMappingURL=i18n.dto.js.map