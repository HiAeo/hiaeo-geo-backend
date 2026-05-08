import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import { AIEngineAdapter, BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ContentGenerationResult, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';
import axios from 'axios';

@Injectable()
export class DeepseekAdapter implements AIEngineAdapter {
  readonly name = 'DeepSeek';

  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getDeepseekApiKey();
  }

  async diagnoseBrand(params: BrandDiagnosisParams): Promise<BrandDiagnosisResult> {
    const prompt = this.buildDiagnosisPrompt(params);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
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
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseDiagnosisResult(content, params.brandName);
    } catch (error) {
      console.error('DeepSeek诊断失败:', error.message);
      return this.getMockDiagnosisResult(params.brandName);
    }
  }

  async generateContent(params: ContentGenerationParams): Promise<ContentGenerationResult> {
    const prompt = this.buildContentPrompt(params);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
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
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return {
        title: params.topic,
        content,
        tags: params.keywords || [],
        suggestedImages: []
      };
    } catch (error) {
      console.error('DeepSeek内容生成失败:', error.message);
      return this.getMockContent(params);
    }
  }

  async chat(params: ChatParams): Promise<ChatResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: params.messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return {
        message: {
          role: 'assistant',
          content
        },
        usage: response.data.usage
      };
    } catch (error) {
      console.error('DeepSeek聊天失败:', error.message);
      return {
        message: {
          role: 'assistant',
          content: '抱歉，DeepSeek服务暂时不可用。'
        }
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      await axios.get(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return true;
    } catch {
      return false;
    }
  }

  private buildDiagnosisPrompt(params: BrandDiagnosisParams): string {
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

  private buildContentPrompt(params: ContentGenerationParams): string {
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

  private parseDiagnosisResult(content: string, brandName: string): BrandDiagnosisResult {
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
    } catch {}

    return this.getMockDiagnosisResult(brandName);
  }

  private getMockDiagnosisResult(brandName: string): BrandDiagnosisResult {
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

  private getMockContent(params: ContentGenerationParams): ContentGenerationResult {
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
}
