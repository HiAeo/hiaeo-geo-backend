"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nService = void 0;
const common_1 = require("@nestjs/common");
const i18next_1 = __importDefault(require("i18next"));
const path = __importStar(require("path"));
let I18nService = class I18nService {
    constructor() {
        this.i18next = i18next_1.default;
        this.initI18n();
    }
    async initI18n() {
        const backendPath = path.join(__dirname, '../../../');
        await this.i18next.init({
            lng: 'zh-CN',
            fallbackLng: 'zh-CN',
            preload: ['zh-CN', 'en-US'],
            ns: ['common', 'knowledge', 'workflow', 'errors'],
            defaultNS: 'common',
            backend: {
                loadPath: path.join(backendPath, 'src/i18n/{{lng}}/{{ns}}.json'),
            },
            interpolation: {
                escapeValue: false,
            },
        });
    }
    async t(key, params, lng) {
        return this.i18next.t(key, { ...params, lng: lng || this.i18next.language });
    }
    setLocale(locale) {
        this.i18next.changeLanguage(locale);
    }
    getLocale() {
        return this.i18next.language || 'zh-CN';
    }
    getSupportedLocales() {
        return [
            { code: 'zh-CN', name: '简体中文' },
            { code: 'en-US', name: 'English' },
        ];
    }
    async getTranslations(locale, namespace) {
        const ns = namespace || 'common';
        const resources = {};
        for (const n of ['common', 'knowledge', 'workflow', 'errors']) {
            if (!namespace || n === ns) {
                try {
                    resources[n] = await this.i18next.getResourceBundle(locale, n);
                }
                catch {
                    resources[n] = {};
                }
            }
        }
        return resources;
    }
};
exports.I18nService = I18nService;
exports.I18nService = I18nService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], I18nService);
//# sourceMappingURL=i18n.service.js.map