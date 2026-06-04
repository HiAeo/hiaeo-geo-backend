import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface QichachaResult {
  basicInfo: {
    companyName?: string;
    industry?: string;
    companySize?: string;
    region?: string;
    website?: string;
    slogan?: string;
    intro?: string;
    businessScope?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    wechat?: string;
    weibo?: string;
    zhihu?: string;
    douyin?: string;
  };
}

@Injectable()
export class QichachaService {
  private readonly logger = new Logger(QichachaService.name);
  
  // 企查查 API 配置（需要替换为实际的 API Key）
  private readonly API_URL = 'https://api.qcc.com';
  private readonly API_KEY = process.env.QICHACHA_API_KEY || '';

  /**
   * 搜索公司信息
   */
  async searchCompany(companyName: string): Promise<QichachaResult> {
    try {
      // 如果没有配置 API Key，返回友好的提示
      if (!this.API_KEY) {
        this.logger.warn('企查查 API Key 未配置');
        return this.getMockData(companyName);
      }

      // 调用企查查 API 搜索公司
      const response = await axios.post(
        `${this.API_URL}/firm/search`,
        {
          keyword: companyName,
          page: 1,
          pageSize: 1,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      if (response.data && response.data.Result) {
        const company = response.data.Result[0];
        return this.parseCompanyInfo(company);
      }

      return this.getMockData(companyName);
    } catch (error) {
      this.logger.error(`企查查查询失败: ${error.message}`);
      // API 调用失败时返回模拟数据
      return this.getMockData(companyName);
    }
  }

  /**
   * 解析企查查返回的公司数据
   */
  private parseCompanyInfo(data: any): QichachaResult {
    return {
      basicInfo: {
        companyName: data.Name || data.name || '',
        industry: this.inferIndustry(data.Scope || data.scope || '', data.Industry || data.industry || ''),
        companySize: this.parseCompanySize(data.EmployeeCount || data.employee_count || ''),
        region: data.Region || data.region || '',
        website: data.Website || data.website || '',
        intro: data.Description || data.description || data.Brief || '',
        businessScope: data.Scope || data.scope || '',
      },
      contact: {
        phone: data.Phone || data.phone || '',
        email: data.Email || data.email || '',
        address: data.Address || data.address || '',
      },
    };
  }

  /**
   * 根据经营范围推断行业
   */
  private inferIndustry(businessScope: string, existingIndustry: string): string {
    if (existingIndustry) return existingIndustry;
    
    const scope = businessScope.toLowerCase();
    
    if (scope.includes('技术') || scope.includes('科技') || scope.includes('软件') || scope.includes('互联网')) {
      return 'technology';
    }
    if (scope.includes('电商') || scope.includes('零售') || scope.includes('商贸')) {
      return 'ecommerce';
    }
    if (scope.includes('教育') || scope.includes('培训') || scope.includes('咨询')) {
      return 'education';
    }
    if (scope.includes('医疗') || scope.includes('健康') || scope.includes('医药')) {
      return 'healthcare';
    }
    if (scope.includes('金融') || scope.includes('投资') || scope.includes('基金')) {
      return 'finance';
    }
    if (scope.includes('餐饮') || scope.includes('食品') || scope.includes('饮料')) {
      return 'food';
    }
    if (scope.includes('制造') || scope.includes('生产') || scope.includes('加工')) {
      return 'manufacture';
    }
    if (scope.includes('服务') || scope.includes('咨询') || scope.includes('代理')) {
      return 'service';
    }
    
    return 'other';
  }

  /**
   * 解析公司规模
   */
  private parseCompanySize(employeeCount: string): string {
    if (!employeeCount) return '';
    
    // 企查查返回的人数格式可能是 "100-500人" 或数字
    const match = employeeCount.match(/(\d+)-?(\d*)/);
    if (match) {
      const count = parseInt(match[1], 10);
      if (count <= 10) return '1-10';
      if (count <= 50) return '11-50';
      if (count <= 200) return '51-200';
      if (count <= 500) return '201-500';
      if (count <= 1000) return '501-1000';
      return '1000+';
    }
    
    return '';
  }

  /**
   * 获取模拟数据（API 未配置时使用）
   */
  private getMockData(companyName: string): QichachaResult {
    this.logger.log(`使用模拟数据查询: ${companyName}`);
    
    return {
      basicInfo: {
        companyName: companyName,
        industry: 'service',
        companySize: '11-50',
        region: '北京市朝阳区',
        website: '',
        slogan: '',
        intro: `【${companyName}】是一家专业从事相关服务的企业，公司秉持客户至上的理念，为客户提供优质的服务体验。公司拥有专业的团队和丰富的行业经验，致力于为客户创造更大的价值。`,
        businessScope: '技术开发、技术咨询、技术服务',
      },
      contact: {
        phone: '',
        email: '',
        address: '',
        wechat: '',
        weibo: '',
        zhihu: '',
        douyin: '',
      },
    };
  }
}
