import { Injectable } from '@nestjs/common';

export interface Strategy {
  id: string;
  brandId: string;
  name: string;
  type: string;
  content: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class StrategyService {
  private strategies: Strategy[] = [];

  async getList(filters: { brandId?: string; status?: string }): Promise<{ list: Strategy[]; total: number }> {
    let result = [...this.strategies];
    
    if (filters.brandId) {
      result = result.filter(s => s.brandId === filters.brandId);
    }
    if (filters.status) {
      result = result.filter(s => s.status === filters.status);
    }
    
    return { list: result, total: result.length };
  }

  async getById(id: string): Promise<Strategy | null> {
    return this.strategies.find(s => s.id === id) || null;
  }

  async generate(dto: any): Promise<Strategy> {
    const strategy: Strategy = {
      id: `str_${Date.now()}`,
      brandId: dto.brandId || '',
      name: dto.name || '新策略',
      type: dto.type || 'content',
      content: this.generateStrategyContent(dto),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.strategies.push(strategy);
    return strategy;
  }

  private generateStrategyContent(dto: any): string {
    return JSON.stringify({
      keywords: dto.keywords || [],
      channels: dto.channels || ['search', 'social'],
      contentTypes: dto.contentTypes || ['article', 'video'],
      timeline: {
        phase1: { duration: '1-2周', tasks: ['关键词研究', '竞品分析'] },
        phase2: { duration: '3-4周', tasks: ['内容创作', '平台适配'] },
        phase3: { duration: '持续', tasks: ['效果监测', '优化迭代'] }
      },
      recommendations: [
        '聚焦长尾关键词，覆盖用户搜索意图',
        '多渠道分发内容，提升品牌曝光',
        '定期分析数据，调整优化策略'
      ]
    }, null, 2);
  }

  async update(id: string, data: Partial<Strategy>): Promise<Strategy | null> {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    this.strategies[index] = {
      ...this.strategies[index],
      ...data,
      updatedAt: new Date()
    };
    
    return this.strategies[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.strategies.splice(index, 1);
    return true;
  }

  async execute(id: string): Promise<{ success: boolean; message: string; executionId?: string }> {
    const strategy = await this.getById(id);
    if (!strategy) {
      return { success: false, message: '策略不存在' };
    }
    
    strategy.status = 'active';
    strategy.updatedAt = new Date();
    
    return { 
      success: true, 
      message: '策略执行中...',
      executionId: `exe_${Date.now()}`
    };
  }
}
