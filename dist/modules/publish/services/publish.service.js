"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishService = void 0;
const common_1 = require("@nestjs/common");
let PublishService = class PublishService {
    async publish(data) {
        return {
            success: true,
            message: '内容发布成功',
            publishId: `pub_${Date.now()}`,
            ...data
        };
    }
};
exports.PublishService = PublishService;
exports.PublishService = PublishService = __decorate([
    (0, common_1.Injectable)()
], PublishService);
//# sourceMappingURL=publish.service.js.map