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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KimiAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../config/config.service");
const axios_1 = __importDefault(require("axios"));
let KimiAdapter = class KimiAdapter {
    constructor(configService) {
        this.configService = configService;
        this.name = 'Kimi';
        this.baseUrl = 'https://api.moonshot.cn/v1';
        this.apiKey = this.configService.getKimiApiKey();
    }
    async diagnoseBrand(params) {
        const prompt = this.buildDiagnosisPrompt(params);
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'moonshot-v1-8k',
                messages: [
                    { role: 'system', content: '你是一位专业的GEO诊断专家。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return this.parseDiagnosisResult(response.data.choices[0].message.content, params.brandName);
        }
        catch (error) {
            console.error('Kimi诊断失败:', error.message);
            return this.getMockDiagnosisResult(params.brandName);
        }
    }
    async generateContent(params) {
        const prompt = this.buildContentPrompt(params);
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'moonshot-v1-8k',
                messages: [
                    { role: 'system', content: '你是一位专业的SEO内容创作专家。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                title: params.topic,
                content: response.data.choices[0].message.content,
                tags: params.keywords || []
            };
        }
        catch (error) {
            console.error('Kimi内容生成失败:', error.message);
            return this.getMockContent(params);
        }
    }
    async chat(params) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'moonshot-v1-8k',
                messages: params.messages.map(m => ({ role: m.role, content: m.content })),
                temperature: params.temperature || 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                message: { role: 'assistant', content: response.data.choices[0].message.content }
            };
        }
        catch (error) {
            console.error('Kimi聊天失败:', error.message);
            return { message: { role: 'assistant', content: '抱歉，Kimi服务暂时不可用。' } };
        }
    }
    buildDiagnosisPrompt(params) {
        return `请对品牌"${params.brandName}"进行GEO诊断分析，返回JSON格式结果。`;
    }
    buildContentPrompt(params) {
        return `请生成关于"${params.topic}"的内容，类型: ${params.contentType}`;
    }
    parseDiagnosisResult(content, brandName) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                return {
                    brandPositioning: data.brandPositioning || '品牌定位待优化',
                    competitiveAdvantages: data.competitiveAdvantages || [],
                    potentialIssues: data.potentialIssues || [],
                    marketOpportunities: data.marketOpportunities || [],
                    contentSuggestions: data.contentSuggestions || [],
                    confidence: data.confidence || 0.8
                };
            }
        }
        catch { }
        return this.getMockDiagnosisResult(brandName);
    }
    getMockDiagnosisResult(brandName) {
        return {
            brandPositioning: `${brandName}是一家专注于创新服务的领先品牌`,
            competitiveAdvantages: ['技术领先', '产品线丰富', '用户口碑良好'],
            potentialIssues: ['品牌知名度有待提升', '内容营销策略需优化'],
            marketOpportunities: ['垂直领域深耕机会', '内容差异化竞争机会'],
            contentSuggestions: ['产出更多高质量原创内容', '加强SEO基础建设'],
            confidence: 0.85
        };
    }
    getMockContent(params) {
        return {
            title: params.topic,
            content: `# ${params.topic}\n\n本文深入探讨${params.topic}相关话题...`,
            tags: params.keywords || []
        };
    }
};
exports.KimiAdapter = KimiAdapter;
exports.KimiAdapter = KimiAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], KimiAdapter);
//# sourceMappingURL=kimi.adapter.js.map