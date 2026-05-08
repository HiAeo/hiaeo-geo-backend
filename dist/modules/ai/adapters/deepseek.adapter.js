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
exports.DeepseekAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../config/config.service");
const axios_1 = __importDefault(require("axios"));
let DeepseekAdapter = class DeepseekAdapter {
    constructor(configService) {
        this.configService = configService;
        this.name = 'DeepSeek';
        this.baseUrl = 'https://api.deepseek.com/v1';
        this.apiKey = this.configService.getDeepseekApiKey();
    }
    async diagnoseBrand(params) {
        const prompt = this.buildDiagnosisPrompt(params);
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一位专业的GEO诊断专家。请对品牌进行全面诊断并以JSON格式返回结果。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            return this.parseDiagnosisResult(content, params.brandName);
        }
        catch (error) {
            console.error('DeepSeek诊断失败:', error.message);
            return this.getMockDiagnosisResult(params.brandName);
        }
    }
    async generateContent(params) {
        const prompt = this.buildContentPrompt(params);
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一位专业的SEO内容创作专家。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: params.maxLength || 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            return {
                title: params.topic,
                content,
                tags: params.keywords || [],
                suggestedImages: []
            };
        }
        catch (error) {
            console.error('DeepSeek内容生成失败:', error.message);
            return this.getMockContent(params);
        }
    }
    async chat(params) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'deepseek-chat',
                messages: params.messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                temperature: params.temperature || 0.7,
                max_tokens: params.maxTokens || 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            return {
                message: {
                    role: 'assistant',
                    content
                },
                usage: response.data.usage
            };
        }
        catch (error) {
            console.error('DeepSeek聊天失败:', error.message);
            return {
                message: {
                    role: 'assistant',
                    content: '抱歉，DeepSeek服务暂时不可用。'
                }
            };
        }
    }
    async healthCheck() {
        if (!this.apiKey)
            return false;
        try {
            await axios_1.default.get(`${this.baseUrl}/models`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    buildDiagnosisPrompt(params) {
        return `
请对品牌"${params.brandName}"进行GEO诊断分析。
${params.productDescription ? `产品描述: ${params.productDescription}` : ''}
${params.competitors?.length ? `竞品: ${params.competitors.join(', ')}` : ''}
${params.marketContext ? `市场背景: ${params.marketContext}` : ''}

请从以下维度进行诊断：
1. 品牌定位 (brandPositioning)
2. 竞争优势 (competitiveAdvantages)
3. 潜在问题 (potentialIssues)
4. 市场机会 (marketOpportunities)
5. 内容建议 (contentSuggestions)

请以JSON格式返回诊断结果，confidence表示诊断置信度(0-1)。
`;
    }
    buildContentPrompt(params) {
        return `
请生成一篇关于"${params.topic}"的内容。

类型: ${params.contentType.replace('_', ' ')}
${params.tone ? `风格: ${params.tone}` : ''}
${params.targetAudience ? `目标受众: ${params.targetAudience}` : ''}
${params.keywords?.length ? `关键词: ${params.keywords.join(', ')}` : ''}
${params.maxLength ? `字数要求: 约${params.maxLength}字` : ''}

要求:
1. SEO友好，包含关键词
2. 结构清晰，有小标题
3. 内容专业、有价值
`;
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
            competitiveAdvantages: [
                '拥有成熟的技术团队',
                '产品线丰富，覆盖多场景',
                '用户口碑良好'
            ],
            potentialIssues: [
                '品牌知名度有待提升',
                '内容营销策略需优化',
                'SEO基础需要加强'
            ],
            marketOpportunities: [
                '垂直领域深耕机会',
                '内容差异化竞争机会',
                '本地化SEO优化机会'
            ],
            contentSuggestions: [
                '产出更多高质量原创内容',
                '建立内容矩阵，覆盖用户全旅程',
                '加强技术SEO基础建设'
            ],
            confidence: 0.85
        };
    }
    getMockContent(params) {
        return {
            title: params.topic,
            content: `# ${params.topic}

## 引言
在当今数字化时代，${params.topic}已成为企业关注的重点领域。

## 主要内容
### 1. 基础知识
了解核心概念和基本原则。

### 2. 最佳实践
- 策略一：注重质量
- 策略二：持续优化
- 策略三：关注用户需求

## 结论
遵循以上建议，实现您的目标。`,
            tags: params.keywords || [],
            suggestedImages: []
        };
    }
};
exports.DeepseekAdapter = DeepseekAdapter;
exports.DeepseekAdapter = DeepseekAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], DeepseekAdapter);
//# sourceMappingURL=deepseek.adapter.js.map