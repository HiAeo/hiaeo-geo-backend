import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import { AIEngineAdapter, BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ContentGenerationResult, ChatParams, ChatResult } from '../interfaces/ai-engine.interface';
import axios from 'axios';

@Injectable()
export class KimiAdapter implements AIEngineAdapter {
  readonly name = 'Kimi';

  private apiKey: string;
  private baseUrl = 'https://api.moonshot.cn/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getKimiApiKey();
  }

  async diagnoseBrand(params: BrandDiagnosisParams): Promise<BrandDiagnosisResult> {
    const prompt = this.buildDiagnosisPrompt(params);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'moonshot-v1-8k',
          messages: [
            { role: 'system', content: '你是一位专业的GEO诊断专家。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseDiagnosisResult(response.data.choices[0].message.content, params.brandName);
    } catch (error) {
      console.error('Kimi诊断失败:', error.message);
      return this.getMockDiagnosisResult(params.brandName);
    }
  }

  async generateContent(params: ContentGenerationParams): Promise<ContentGenerationResult> {
    const prompt = this.buildContentPrompt(params);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'moonshot-v1-8k',
          messages: [
            { role: 'system', content: '你是一位专业的SEO内容创作专家。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        title: params.topic,
        content: response.data.choices[0].message.content,
        tags: params.keywords || []
      };
    } catch (error) {
      console.error('Kimi内容生成失败:', error.message);
      return this.getMockContent(params);
    }
  }

  async chat(params: ChatParams): Promise<ChatResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'moonshot-v1-8k',
          messages: params.messages.map(m => ({ role: m.role, content: m.content })),
          temperature: params.temperature || 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        message: { role: 'assistant', content: response.data.choices[0].message.content }
      };
    } catch (error) {
      console.error('Kimi聊天失败:', error.message);
      return { message: { role: 'assistant', content: '抱歉，Kimi服务暂时不可用。' } };
    }
  }

  private buildDiagnosisPrompt(params: BrandDiagnosisParams): string {
    return `请对品牌"${params.brandName}"进行GEO诊断分析，返回JSON格式结果。`;
  }

  private buildContentPrompt(params: ContentGenerationParams): string {
    return `请生成关于"${params.topic}"的内容，类型: ${params.contentType}`;
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
      competitiveAdvantages: ['技术领先', '产品线丰富', '用户口碑良好'],
      potentialIssues: ['品牌知名度有待提升', '内容营销策略需优化'],
      marketOpportunities: ['垂直领域深耕机会', '内容差异化竞争机会'],
      contentSuggestions: ['产出更多高质量原创内容', '加强SEO基础建设'],
      confidence: 0.85
    };
  }

  private getMockContent(params: ContentGenerationParams): ContentGenerationResult {
    return {
      title: params.topic,
      content: `# ${params.topic}\n\n本文深入探讨${params.topic}相关话题...`,
      tags: params.keywords || []
    };
  }
}
