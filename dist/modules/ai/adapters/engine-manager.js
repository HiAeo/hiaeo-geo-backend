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
exports.EngineManager = void 0;
const common_1 = require("@nestjs/common");
const deepseek_adapter_1 = require("./deepseek.adapter");
const kimi_adapter_1 = require("./kimi.adapter");
const qwen_adapter_1 = require("./qwen.adapter");
const zhipu_adapter_1 = require("./zhipu.adapter");
const doubao_adapter_1 = require("./doubao.adapter");
const wenxin_adapter_1 = require("./wenxin.adapter");
let EngineManager = class EngineManager {
    constructor(deepseekAdapter, kimiAdapter, qwenAdapter, zhipuAdapter, doubaoAdapter, wenxinAdapter) {
        this.deepseekAdapter = deepseekAdapter;
        this.kimiAdapter = kimiAdapter;
        this.qwenAdapter = qwenAdapter;
        this.zhipuAdapter = zhipuAdapter;
        this.doubaoAdapter = doubaoAdapter;
        this.wenxinAdapter = wenxinAdapter;
        this.engines = new Map();
        this.registerEngine(this.deepseekAdapter);
        this.registerEngine(this.kimiAdapter);
        this.registerEngine(this.qwenAdapter);
        this.registerEngine(this.zhipuAdapter);
        this.registerEngine(this.doubaoAdapter);
        this.registerEngine(this.wenxinAdapter);
    }
    registerEngine(adapter) {
        this.engines.set(adapter.name.toLowerCase(), adapter);
    }
    getEngine(name) {
        if (name) {
            return this.engines.get(name.toLowerCase()) || this.engines.get('deepseek');
        }
        return this.engines.get('deepseek');
    }
    getAvailableEngines() {
        return Array.from(this.engines.keys());
    }
    async diagnoseBrand(params, engine) {
        const adapter = this.getEngine(engine);
        if (!adapter) {
            throw new Error(`Engine ${engine} not found`);
        }
        return adapter.diagnoseBrand(params);
    }
    async batchDiagnose(params, engines) {
        const targetEngines = engines || this.getAvailableEngines();
        const results = [];
        const successfulResults = [];
        for (const engineName of targetEngines) {
            try {
                const adapter = this.getEngine(engineName);
                if (adapter) {
                    const result = await adapter.diagnoseBrand(params);
                    results.push({ engine: adapter.name, result });
                    successfulResults.push(result);
                }
            }
            catch (error) {
                console.error(`诊断引擎 ${engineName} 失败:`, error.message);
            }
        }
        if (successfulResults.length === 0) {
            return {
                brandPositioning: '诊断失败',
                competitiveAdvantages: [],
                potentialIssues: ['所有AI引擎诊断均失败'],
                marketOpportunities: [],
                contentSuggestions: [],
                confidence: 0,
                engine: 'none',
                diagnosedAt: new Date(),
                diagnosisId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        }
        const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
        const allAdvantages = successfulResults.flatMap(r => r.competitiveAdvantages);
        const allIssues = successfulResults.flatMap(r => r.potentialIssues);
        const allOpportunities = successfulResults.flatMap(r => r.marketOpportunities);
        const allSuggestions = successfulResults.flatMap(r => r.contentSuggestions);
        return {
            brandPositioning: successfulResults[0].brandPositioning,
            competitiveAdvantages: [...new Set(allAdvantages)].slice(0, 5),
            potentialIssues: [...new Set(allIssues)].slice(0, 5),
            marketOpportunities: [...new Set(allOpportunities)].slice(0, 5),
            contentSuggestions: [...new Set(allSuggestions)].slice(0, 5),
            confidence: avgConfidence,
            engine: successfulResults.map(r => r.confidence === Math.max(...successfulResults.map(sr => sr.confidence)) ? r.confidence.toString() : '').filter(Boolean)[0] || 'deepseek',
            diagnosedAt: new Date(),
            diagnosisId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
    async generateContent(params, engine) {
        const adapter = this.getEngine(engine);
        if (!adapter) {
            throw new Error(`Engine ${engine} not found`);
        }
        return adapter.generateContent(params);
    }
    async chat(params, engine) {
        const adapter = this.getEngine(engine);
        if (!adapter) {
            throw new Error(`Engine ${engine} not found`);
        }
        return adapter.chat(params);
    }
    async checkEnginesHealth() {
        const statuses = [];
        for (const [name, adapter] of this.engines.entries()) {
            try {
                const healthy = await adapter.healthCheck();
                statuses.push({ name: adapter.name, healthy });
            }
            catch (error) {
                statuses.push({ name: adapter.name, healthy: false, error: error.message });
            }
        }
        return statuses;
    }
};
exports.EngineManager = EngineManager;
exports.EngineManager = EngineManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deepseek_adapter_1.DeepseekAdapter,
        kimi_adapter_1.KimiAdapter,
        qwen_adapter_1.QwenAdapter,
        zhipu_adapter_1.ZhipuAdapter,
        doubao_adapter_1.DoubaoAdapter,
        wenxin_adapter_1.WenxinAdapter])
], EngineManager);
//# sourceMappingURL=engine-manager.js.map