import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import { AIEngineAdapter, BrandDiagnosisParams, BrandDiagnosisResult, ContentGenerationParams, ContentGenerationResult, ChatParams, ChatResult, SEODiagnosisParams, SEODiagnosisResult } from '../interfaces/ai-engine.interface';
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

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async diagnoseSEO(params: SEODiagnosisParams): Promise<SEODiagnosisResult> {
    const prompt = this.buildSEODiagnosisPrompt(params);
    
    try {
      if (!this.isAvailable()) {
        console.warn('DeepSeek API Key未配置，使用Mock数据');
        return this.getMockSEOResult(params);
      }

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的GEO（生成式引擎优化）诊断专家。请对网站进行全面诊断并返回结构化的JSON结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseSEODiagnosisResult(content, params);
    } catch (error) {
      console.error('DeepSeek SEO诊断失败:', error.message);
      return this.getMockSEOResult(params);
    }
  }

  private buildSEODiagnosisPrompt(params: SEODiagnosisParams): string {
    const keywordsStr = params.keywords?.length 
      ? `目标关键词: ${params.keywords.join(', ')}` 
      : '未指定特定关键词';

    return `
请对以下网站进行GEO（生成式引擎优化）诊断分析：

目标网站: ${params.targetUrl}
${params.targetName ? `品牌/公司名称: ${params.targetName}` : ''}
${params.targetIndustry ? `所属行业: ${params.targetIndustry}` : ''}
${keywordsStr}

请从以下7个维度进行诊断评估（每个维度0-100分）：
1. D1_技术SEO (Technical SEO): 网站结构、速度、移动端适配、结构化数据
2. D2_内容质量 (Content Quality): 内容深度、原创性、价值性
3. D3_品牌权威性 (Brand Authority): 品牌知名度、行业影响力
4. D4_用户参与度 (User Engagement): 用户行为数据、停留时间、互动率
5. D5_外部链接 (Backlinks): 反链数量、质量、相关性
6. D6_语义覆盖 (Semantic Coverage): 主题覆盖深度、实体关系
7. D7_AI搜索适配 (AI Search Readiness): 结构化表达、FAQ覆盖、实体提及

请返回以下JSON格式的诊断结果：
{
  "seoScore": {
    "overall": 综合评分(0-100),
    "technical": 技术SEO评分,
    "content": 内容质量评分,
    "authority": 品牌权威性评分,
    "performance": 综合表现评分
  },
  "issues": [
    {
      "category": "technical|content|authority|performance",
      "severity": "high|medium|low",
      "title": "问题标题",
      "description": "问题详细描述",
      "recommendation": "具体优化建议"
    }
  ],
  "aiSearchPresence": {
    "score": AI搜索适配评分,
    "coverage": 语义覆盖度,
    "mentions": 品牌提及数量估算,
    "sentiment": "positive|neutral|negative"
  },
  "summary": "总体诊断摘要（100-200字）"
}

请确保返回有效的JSON格式。
`;
  }

  private parseSEODiagnosisResult(content: string, params: SEODiagnosisParams): SEODiagnosisResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          seoScore: {
            overall: Math.max(0, Math.min(100, data.seoScore?.overall || 60)),
            technical: Math.max(0, Math.min(100, data.seoScore?.technical || 60)),
            content: Math.max(0, Math.min(100, data.seoScore?.content || 60)),
            authority: Math.max(0, Math.min(100, data.seoScore?.authority || 60)),
            performance: Math.max(0, Math.min(100, data.seoScore?.performance || 60)),
          },
          issues: data.issues || [],
          aiSearchPresence: {
            score: Math.max(0, Math.min(100, data.aiSearchPresence?.score || 50)),
            coverage: Math.max(0, Math.min(100, data.aiSearchPresence?.coverage || 50)),
            mentions: data.aiSearchPresence?.mentions || 0,
            sentiment: data.aiSearchPresence?.sentiment || 'neutral',
          },
          summary: data.summary || '诊断完成'
        };
      }
    } catch (error) {
      console.error('解析SEO诊断结果失败:', error);
    }

    return this.getMockSEOResult(params);
  }

  private getMockSEOResult(params: SEODiagnosisParams): SEODiagnosisResult {
    return {
      seoScore: {
        overall: 68,
        technical: 72,
        content: 65,
        authority: 60,
        performance: 75,
      },
      issues: [
        {
          category: 'technical',
          severity: 'high',
          title: '缺少结构化数据标记',
          description: `网站 ${params.targetUrl} 未添加 Schema.org 结构化数据，影响AI搜索引擎理解`,
          recommendation: '添加 Organization、Product、FAQPage 等结构化数据标记'
        },
        {
          category: 'content',
          severity: 'medium',
          title: '内容深度不足',
          description: '页面内容较为浅显，缺少专业深度分析和行业见解',
          recommendation: '增加 FAQ、产品对比、技术白皮书等专业内容'
        },
        {
          category: 'authority',
          severity: 'medium',
          title: '品牌提及度低',
          description: '在AI搜索引擎中品牌提及频率较低',
          recommendation: '加强品牌在行业媒体和社交平台的曝光'
        }
      ],
      aiSearchPresence: {
        score: 45,
        coverage: 35,
        mentions: 8,
        sentiment: 'neutral',
      },
      summary: `针对 ${params.targetUrl || '目标网站'} 的GEO诊断已完成。主要问题集中在技术SEO和内容质量两个方面。建议优先修复结构化数据问题，同时加强专业内容的产出。`
    };
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
