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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const engine_manager_1 = require("../adapters/engine-manager");
let AiService = class AiService {
    constructor(engineManager) {
        this.engineManager = engineManager;
    }
    async getEngineList() {
        return this.engineManager.getAvailableEngines();
    }
    async diagnose(params, engineType) {
        return this.engineManager.diagnoseBrand(params, engineType);
    }
    async diagnoseWithAllEngines(params) {
        return this.engineManager.batchDiagnose(params);
    }
    async generateContent(params, engineType) {
        return this.engineManager.generateContent(params, engineType);
    }
    async chat(params, engineType) {
        return this.engineManager.chat(params, engineType);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [engine_manager_1.EngineManager])
], AiService);
//# sourceMappingURL=ai.service.js.map