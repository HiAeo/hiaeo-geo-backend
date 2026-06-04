import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface BrandFillResult {
  bizPositioning: {
    coreBusiness?: string;
    targetCustomers?: string;
    positioning?: string;
    differentiation?: string;
    brandStory?: string;
  };
  productService: {
    mainProducts?: string;
    sellPoints?: string;
    serviceProcess?: string;
    priceRange?: string;
    seoKeywords?: string;
  };
  competitorMarket: {
    competitors?: string;
    marketEnv?: string;
    comparisonAdvantage?: string;
  };
  geoGoals: {
    geoKeywords?: string;
    targetRegions?: string;
    contentGoals?: string;
    contentStyle?: string;
  };
}

@Injectable()
export class AIModelService {
  private readonly logger = new Logger(AIModelService.name);
  
  // DeepSeek API 配置
  private readonly DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
  private readonly DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
  
  // 豆包 API 配置
  private readonly DOUYIN_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  private readonly DOUYIN_API_KEY = process.env.DOUYIN_API_KEY || '';
  
  // 默认使用 DeepSeek
  private getApiConfig() {
    if (this.DOUYIN_API_KEY) {
      return {
        url: this.DOUYIN_API_URL,
        key: this.DOUYIN_API_KEY,
        model: 'doubao-pro',
      };
    }
    return {
      url: this.DEEPSEEK_API_URL,
      key: this.DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
    };
  }

  /**
   * 通过大模型填充品牌信息
   */
  async fillBrandInfo(companyName: string, qccData: any): Promise<BrandFillResult> {
    try {
      const apiConfig = this.getApiConfig();
      
      if (!apiConfig.key) {
        this.logger.warn('未配置大模型 API Key，使用模拟数据');
        return this.getMockData(companyName);
      }

      const prompt = this.buildPrompt(companyName, qccData);
      
      const response = await axios.post(
        apiConfig.url,
        {
          model: apiConfig.model,
          messages: [
            {
              role: 'system',
              content: `你是一个专业的品牌分析专家。请根据用户提供的公司信息，通过互联网搜索和分析，生成完整的品牌信息。

请严格按照以下JSON格式返回数据，不要包含任何其他内容：

{
  "bizPositioning": {
    "coreBusiness": "核心业务介绍（200字以内）",
    "targetCustomers": "目标客户群体描述",
    "positioning": "品牌定位语（一句话）",
    "differentiation": "差异化优势（3-5点）",
    "brandStory": "品牌故事（可选，100字以内）"
  },
  "productService": {
    "mainProducts": "主要产品/服务详情",
    "sellPoints": "产品/服务卖点（3-5点）",
    "serviceProcess": "服务流程或购买流程",
    "priceRange": "价格区间（可选）",
    "seoKeywords": "SEO关键词（用逗号分隔，10个以内）"
  },
  "competitorMarket": {
    "competitors": "主要竞争对手（3-5个，用逗号分隔）",
    "marketEnv": "市场环境分析（100字以内）",
    "comparisonAdvantage": "相对竞争优势"
  },
  "geoGoals": {
    "geoKeywords": "GEO关键词（与业务相关的知识型搜索关键词，用逗号分隔）",
    "targetRegions": "目标推广地区",
    "contentGoals": "内容目标（如：建立行业权威、提升品牌认知等）",
    "contentStyle": "内容风格建议"
  }
}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiConfig.key}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2分钟超时
        },
      );

      const content = response.data.choices?.[0]?.message?.content;
      if (content) {
        return this.parseResponse(content);
      }

      return this.getMockData(companyName);
    } catch (error) {
      this.logger.error(`大模型调用失败: ${error.message}`);
      // API 调用失败时返回模拟数据
      return this.getMockData(companyName);
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(companyName: string, qccData: any): string {
    let context = `公司名称：${companyName}\n`;
    
    if (qccData?.basicInfo) {
      const info = qccData.basicInfo;
      if (info.industry) context += `所属行业：${info.industry}\n`;
      if (info.businessScope) context += `经营范围：${info.businessScope}\n`;
      if (info.region) context += `所在地区：${info.region}\n`;
      if (info.website) context += `官网：${info.website}\n`;
    }
    
    context += `\n请根据以上信息，结合互联网搜索，生成完整的品牌信息。`;

    return context;
  }

  /**
   * 解析大模型返回的响应
   */
  private parseResponse(content: string): BrandFillResult {
    try {
      // 尝试提取 JSON
      let jsonStr = content;
      
      // 处理可能的 markdown 代码块
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      // 尝试直接解析
      const data = JSON.parse(jsonStr.trim());
      
      return {
        bizPositioning: data.bizPositioning || {},
        productService: data.productService || {},
        competitorMarket: data.competitorMarket || {},
        geoGoals: data.geoGoals || {},
      };
    } catch (error) {
      this.logger.error(`解析大模型响应失败: ${error.message}`);
      return this.getMockData('');
    }
  }

  /**
   * 获取模拟数据（API 未配置时使用）
   */
  private getMockData(companyName: string): BrandFillResult {
    const name = companyName || '该公司';
    
    return {
      bizPositioning: {
        coreBusiness: `${name}是一家专业从事相关服务的企业，致力于为客户提供优质的产品和服务。公司拥有专业的研发团队和丰富的行业经验，不断创新，追求卓越。`,
        targetCustomers: '中小企业主、企业管理者、专业人士、对品质有要求的消费者',
        positioning: '专业、可信赖的行业领先品牌',
        differentiation: '1. 专业技术团队支撑\n2. 多年行业深耕经验\n3. 完善的售后服务体系\n4. 高性价比产品方案\n5. 持续创新研发能力',
        brandStory: `${name}自成立以来，始终坚持以客户需求为导向，不断追求技术创新和服务优化。`,
      },
      productService: {
        mainProducts: '主要产品/服务类别介绍，包括核心产品线、特色服务内容等',
        sellPoints: '1. 品质保障：严格的质量控制体系\n2. 专业服务：资深团队全程支持\n3. 创新技术：持续研发投入，保持技术领先\n4. 合理价格：高性价比，物超所值\n5. 售后无忧：完善的售后服务保障',
        serviceProcess: '1. 需求沟通 → 2. 方案定制 → 3. 签订合同 → 4. 执行实施 → 5. 验收交付 → 6. 售后跟进',
        priceRange: '根据项目需求定制，详情请咨询客服',
        seoKeywords: `${companyName}, ${companyName}怎么样, ${companyName}服务, 行业解决方案, 专业服务商`,
      },
      competitorMarket: {
        competitors: '行业内主要竞争对手A, 竞争对手B, 竞争对手C',
        marketEnv: '当前市场处于快速发展阶段，行业前景广阔，数字化转型为企业发展带来新机遇。',
        comparisonAdvantage: '相比竞争对手，我们在技术创新、服务响应速度、定制化能力方面具有明显优势。',
      },
      geoGoals: {
        geoKeywords: `${companyName}怎么样, ${companyName}口碑, ${companyName}评价, 行业最佳实践, ${companyName}解决方案, 行业知识百科`,
        targetRegions: '全国范围，重点一二线城市',
        contentGoals: '1. 建立品牌行业权威形象\n2. 提升品牌知名度和美誉度\n3. 获取潜在客户信任\n4. 沉淀品牌知识资产',
        contentStyle: '专业、权威、深度，避免过度营销感，以知识分享和价值输出为主',
      },
    };
  }
}
