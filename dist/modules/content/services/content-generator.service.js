"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGeneratorService = void 0;
const common_1 = require("@nestjs/common");
let ContentGeneratorService = class ContentGeneratorService {
    async generateContent(prompt, type = 'article') {
        return {
            title: `生成的标题 - ${prompt}`,
            body: `这是根据 "${prompt}" 生成的内容。\n\n实际项目中，这里会调用AI服务来生成有意义的内容。`,
            type,
        };
    }
    async optimizeContent(content) {
        return content;
    }
    async checkSensitiveWords(content) {
        return { hasSensitive: false, words: [] };
    }
};
exports.ContentGeneratorService = ContentGeneratorService;
exports.ContentGeneratorService = ContentGeneratorService = __decorate([
    (0, common_1.Injectable)()
], ContentGeneratorService);
//# sourceMappingURL=content-generator.service.js.map