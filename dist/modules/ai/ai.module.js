"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./controllers/ai.controller");
const ai_service_1 = require("./services/ai.service");
const engine_manager_1 = require("./adapters/engine-manager");
const deepseek_adapter_1 = require("./adapters/deepseek.adapter");
const kimi_adapter_1 = require("./adapters/kimi.adapter");
const qwen_adapter_1 = require("./adapters/qwen.adapter");
const zhipu_adapter_1 = require("./adapters/zhipu.adapter");
const doubao_adapter_1 = require("./adapters/doubao.adapter");
const wenxin_adapter_1 = require("./adapters/wenxin.adapter");
const config_module_1 = require("../../config/config.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_service_1.AiService,
            engine_manager_1.EngineManager,
            deepseek_adapter_1.DeepseekAdapter,
            kimi_adapter_1.KimiAdapter,
            qwen_adapter_1.QwenAdapter,
            zhipu_adapter_1.ZhipuAdapter,
            doubao_adapter_1.DoubaoAdapter,
            wenxin_adapter_1.WenxinAdapter,
        ],
        exports: [ai_service_1.AiService, engine_manager_1.EngineManager],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map