import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/services/ai.service';
import {
  GenerateMofaStrategyDto,
  StrategyType,
  ContentPlatform,
  MofaStrategyResultDto,
  MofaStrategyContent,
} from '../dto/mofa-strategy.dto';

@Injectable()
export class MofaStrategyService {
  private strategies: Map<string, MofaStrategyResultDto> = new Map();

  constructor(private aiService: AiService) {}

  /**
   * 生成模豆策略
   */
  async generateStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto> {
    const id = `mofa_str_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 构建 AI 提示词
    const prompt = this.buildStrategyPrompt(dto);

    try {
      // 调用 AI 生成策略
      const result = await this.aiService.chat({
        messages: [{ role: 'user', content: prompt }],
      }, 'deepseek');

      // 解析 AI 返回的策略内容
      const content = this.parseStrategyContent(result.message.content, dto);

      const strategy: MofaStrategyResultDto = {
        id,
        name: `${dto.brandName} - ${this.getStrategyTypeName(dto.strategyType)}策略`,
        type: dto.strategyType,
        brandName: dto.brandName,
        status: 'draft',
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.strategies.set(id, strategy);
      return strategy;
    } catch (error) {
      // 如果 AI 调用失败，返回示例策略
      return this.generateSampleStrategy(id, dto);
    }
  }

  /**
   * 获取策略列表
   */
  async getStrategyList(filters: {
    brandId?: string;
    strategyType?: StrategyType;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: MofaStrategyResultDto[]; total: number; page: number; pageSize: number }> {
    let result = Array.from(this.strategies.values());

    // 过滤
    if (filters.brandId) {
      result = result.filter(s => s.brandName.includes(filters.brandId || ''));
    }
    if (filters.strategyType) {
      result = result.filter(s => s.type === filters.strategyType);
    }
    if (filters.status) {
      result = result.filter(s => s.status === filters.status);
    }

    // 分页
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = result.length;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);

    return { list, total, page, pageSize };
  }

  /**
   * 获取策略详情
   */
  async getStrategyById(id: string): Promise<MofaStrategyResultDto | null> {
    return this.strategies.get(id) || null;
  }

  /**
   * 更新策略
   */
  async updateStrategy(id: string, updates: Partial<MofaStrategyResultDto>): Promise<MofaStrategyResultDto | null> {
    const strategy = this.strategies.get(id);
    if (!strategy) return null;

    const updated = {
      ...strategy,
      ...updates,
      updatedAt: new Date(),
    };

    this.strategies.set(id, updated);
    return updated;
  }

  /**
   * 删除策略
   */
  async deleteStrategy(id: string): Promise<boolean> {
    return this.strategies.delete(id);
  }

  /**
   * 激活策略
   */
  async activateStrategy(id: string): Promise<MofaStrategyResultDto | null> {
    const strategy = this.strategies.get(id);
    if (!strategy) return null;

    strategy.status = 'active';
    strategy.updatedAt = new Date();
    this.strategies.set(id, strategy);
    return strategy;
  }

  /**
   * 生成竞品策略
   */
  async generateCompetitorStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto> {
    dto.strategyType = StrategyType.COMPETITOR;
    return this.generateStrategy(dto);
  }

  /**
   * 生成产品策略
   */
  async generateProductStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto> {
    dto.strategyType = StrategyType.PRODUCT;
    return this.generateStrategy(dto);
  }

  /**
   * 生成 FAQ 策略
   */
  async generateFaqStrategy(dto: GenerateMofaStrategyDto): Promise<MofaStrategyResultDto> {
    dto.strategyType = StrategyType.FAQ;
    return this.generateStrategy(dto);
  }

  // ==================== 私有方法 ====================

  private buildStrategyPrompt(dto: GenerateMofaStrategyDto): string {
    const strategyTypeName = this.getStrategyTypeName(dto.strategyType);
    const platformNames = dto.targetPlatforms?.map(p => this.getPlatformName(p)).join('、') || '全平台';

    let prompt = `请为"${dto.brandName}"品牌生成一份专业的${strategyTypeName}。

品牌信息：
- 品牌名称：${dto.brandName}
- 产品/服务：${dto.productDescription || '待补充'}
- 目标受众：${dto.targetAudience || '待确定'}
- 行业领域：${dto.industry || '待确定'}
${dto.keywords?.length ? `- 核心关键词：${dto.keywords.join('、')}` : ''}
${dto.competitors ? `- 主要竞争对手：${dto.competitors}` : ''}
${dto.budget ? `- 预算范围：${dto.budget}` : ''}
${dto.brandStrengths ? `- 品牌优势：${dto.brandStrengths}` : ''}
${dto.brandChallenges ? `- 面临挑战：${dto.brandChallenges}` : ''}

目标平台：${platformNames}
计划周期：${dto.planningWeeks || 12}周

请生成包含以下内容的详细策略：
1. 策略概览（摘要、核心目标、KPI）
2. 内容策略（主题、类型分布）
3. 关键词策略（核心词、长尾词）
4. 平台执行计划（各平台具体方案）
5. 执行时间线（分阶段任务）
${dto.competitors ? '6. 竞品分析（对比与机会点）' : ''}
7. 建议与风险
8. 资源需求

请以JSON格式返回策略内容，便于程序解析。`;

    return prompt;
  }

  private parseStrategyContent(aiContent: string, dto: GenerateMofaStrategyDto): MofaStrategyContent {
    // 尝试解析 AI 返回的 JSON
    try {
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return this.normalizeStrategyContent(parsed, dto);
      }
    } catch (e) {
      // 解析失败，使用默认内容
    }

    return this.getDefaultStrategyContent(dto);
  }

  private normalizeStrategyContent(parsed: any, dto: GenerateMofaStrategyDto): MofaStrategyContent {
    return {
      summary: parsed.summary || `${dto.brandName}品牌${this.getStrategyTypeName(dto.strategyType)}方案`,
      coreObjectives: parsed.coreObjectives || ['提升品牌知名度', '获取优质流量', '提高转化率'],
      kpis: parsed.kpis || [
        { name: '内容产出', target: '100篇/月', current: '50篇/月' },
        { name: '搜索排名', target: '前10名', current: '30名以后' },
        { name: '流量增长', target: '+50%', current: '-' },
      ],
      contentThemes: parsed.contentThemes || [
        { theme: '产品介绍', description: '详细介绍产品功能和优势', priority: 'high' },
        { theme: '行业洞察', description: '分享行业趋势和分析', priority: 'high' },
        { theme: '用户案例', description: '展示成功案例和客户故事', priority: 'medium' },
      ],
      contentTypeDistribution: parsed.contentTypeDistribution || [
        { type: '图文文章', percentage: 40, examples: ['产品评测', '使用教程'] },
        { type: '短视频', percentage: 30, examples: ['产品介绍', '品牌故事'] },
        { type: '问答内容', percentage: 20, examples: ['FAQ', '常见问题'] },
        { type: '其他', percentage: 10, examples: ['海报', '信息图'] },
      ],
      coreKeywords: parsed.coreKeywords || (dto.keywords || []).map(k => ({
        keyword: k,
        searchVolume: '中等',
        difficulty: '中等',
        priority: 'high' as const,
      })),
      longTailKeywords: parsed.longTailKeywords || [
        { keyword: `${dto.brandName}怎么样`, intent: '品牌了解', opportunity: '高' },
        { keyword: `${dto.brandName}好不好用`, intent: '产品评估', opportunity: '高' },
        { keyword: `${dto.brandName}价格`, intent: '购买决策', opportunity: '中' },
      ],
      platformPlan: parsed.platformPlan || this.generateDefaultPlatformPlan(dto),
      timeline: parsed.timeline || this.generateDefaultTimeline(dto.planningWeeks || 12),
      competitorAnalysis: parsed.competitorAnalysis,
      recommendations: parsed.recommendations || [
        '聚焦核心关键词，建立内容壁垒',
        '多平台分发，提升品牌曝光',
        '持续优化，数据驱动迭代',
      ],
      risks: parsed.risks || [
        { risk: '内容产出不及时', probability: 'medium', mitigation: '建立内容日历，提前规划' },
        { risk: '关键词竞争激烈', probability: 'high', mitigation: '聚焦长尾词，差异化竞争' },
      ],
      resourceRequirements: parsed.resourceRequirements || [
        { type: '内容编辑', quantity: '2人', cost: '1-2万/月' },
        { type: '设计师', quantity: '1人', cost: '0.8-1.5万/月' },
        { type: '视频制作', quantity: '1人', cost: '1-2万/月' },
      ],
    };
  }

  private generateDefaultPlatformPlan(dto: GenerateMofaStrategyDto): MofaStrategyContent['platformPlan'] {
    const platforms = dto.targetPlatforms || [ContentPlatform.WEBSITE, ContentPlatform.WECHAT, ContentPlatform.WEIBO];

    const platformConfig: Record<ContentPlatform, any> = {
      [ContentPlatform.WEBSITE]: {
        contentTypes: ['SEO文章', '产品页面', '博客'],
        postingFrequency: '每天1-2篇',
        keyMetrics: ['自然搜索流量', '页面停留时间', '转化率'],
        budget: '30%',
      },
      [ContentPlatform.WECHAT]: {
        contentTypes: ['图文文章', '服务号推文'],
        postingFrequency: '每周3-4篇',
        keyMetrics: ['阅读量', '在看数', '粉丝增长'],
        budget: '20%',
      },
      [ContentPlatform.WECHAT_MOMENTS]: {
        contentTypes: ['产品海报', '活动宣传'],
        postingFrequency: '每天2-3条',
        keyMetrics: ['互动率', '转发数'],
        budget: '10%',
      },
      [ContentPlatform.WEIBO]: {
        contentTypes: ['短图文', '话题参与'],
        postingFrequency: '每天3-5条',
        keyMetrics: ['转发', '评论', '粉丝'],
        budget: '15%',
      },
      [ContentPlatform.DOUYIN]: {
        contentTypes: ['短视频', '直播'],
        postingFrequency: '每周3-5条',
        keyMetrics: ['播放量', '点赞', '带货转化'],
        budget: '25%',
      },
      [ContentPlatform.XIAOHONGSHU]: {
        contentTypes: ['种草笔记', '评测图文'],
        postingFrequency: '每周2-3篇',
        keyMetrics: ['笔记曝光', '收藏数', '转化'],
        budget: '20%',
      },
      [ContentPlatform.BILIBILI]: {
        contentTypes: ['知识视频', '品牌纪录片'],
        postingFrequency: '每月2-4条',
        keyMetrics: ['播放量', '弹幕', '粉丝'],
        budget: '15%',
      },
      [ContentPlatform.BAIDU]: {
        contentTypes: ['问答', '百科词条'],
        postingFrequency: '持续优化',
        keyMetrics: ['收录量', '排名'],
        budget: '10%',
      },
      [ContentPlatform.TAOBAO]: {
        contentTypes: ['商品详情', '买家秀'],
        postingFrequency: '持续优化',
        keyMetrics: ['访客数', '转化率', '好评率'],
        budget: '20%',
      },
      [ContentPlatform.TMALL]: {
        contentTypes: ['品牌详情', '活动素材'],
        postingFrequency: '活动期间密集',
        keyMetrics: ['加购率', '销售额'],
        budget: '20%',
      },
      [ContentPlatform.JD]: {
        contentTypes: ['商品页面', '促销内容'],
        postingFrequency: '持续优化',
        keyMetrics: ['曝光量', '转化率'],
        budget: '15%',
      },
    };

    return platforms.map(platform => ({
      platform,
      ...(platformConfig[platform] || platformConfig[ContentPlatform.WEBSITE]),
    }));
  }

  private generateDefaultTimeline(weeks: number): MofaStrategyContent['timeline'] {
    const phaseLength = Math.floor(weeks / 3);

    return [
      {
        phase: '第一阶段：基础建设',
        duration: `${phaseLength}周`,
        startWeek: 1,
        endWeek: phaseLength,
        tasks: [
          { task: '关键词研究与分析', deliverable: '关键词库', owner: '运营' },
          { task: '竞品内容调研', deliverable: '竞品分析报告', owner: '运营' },
          { task: '内容框架搭建', deliverable: '内容模板库', owner: '编辑' },
          { task: '平台账号开通', deliverable: '账号矩阵', owner: '运营' },
        ],
        milestones: ['关键词库完成', '内容模板确定', '账号矩阵搭建完成'],
      },
      {
        phase: '第二阶段：内容产出',
        duration: `${phaseLength}周`,
        startWeek: phaseLength + 1,
        endWeek: phaseLength * 2,
        tasks: [
          { task: 'SEO文章批量生产', deliverable: '每月50篇', owner: '编辑' },
          { task: '短视频制作', deliverable: '每周3条', owner: '视频' },
          { task: '社交媒体日常运营', deliverable: '每日更新', owner: '运营' },
          { task: '用户案例收集', deliverable: '每月2个', owner: '销售' },
        ],
        milestones: ['内容日历执行率>80%', '首个爆款内容出现'],
      },
      {
        phase: '第三阶段：优化迭代',
        duration: `${weeks - phaseLength * 2}周`,
        startWeek: phaseLength * 2 + 1,
        endWeek: weeks,
        tasks: [
          { task: '数据复盘与优化', deliverable: '周报/月报', owner: '运营' },
          { task: '内容策略调整', deliverable: '优化方案', owner: '运营' },
          { task: '新渠道探索', deliverable: '新平台测试', owner: '运营' },
          { task: '效果放大', deliverable: '爆款复制', owner: '全员' },
        ],
        milestones: ['KPI达成', 'ROI转正', '可复制的SOP沉淀'],
      },
    ];
  }

  private generateSampleStrategy(id: string, dto: GenerateMofaStrategyDto): MofaStrategyResultDto {
    const content = this.getDefaultStrategyContent(dto);

    return {
      id,
      name: `${dto.brandName} - ${this.getStrategyTypeName(dto.strategyType)}策略`,
      type: dto.strategyType,
      brandName: dto.brandName,
      status: 'draft',
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private getDefaultStrategyContent(dto: GenerateMofaStrategyDto): MofaStrategyContent {
    return {
      summary: `${dto.brandName}品牌${this.getStrategyTypeName(dto.strategyType)}方案，围绕${dto.industry || '所属行业'}领域，通过多渠道内容运营实现品牌增长。`,
      coreObjectives: [
        '提升品牌在目标领域的知名度和影响力',
        '建立系统的内容生产与分发体系',
        '通过SEO和社交流量获取精准用户',
        '形成可复用的内容运营SOP',
      ],
      kpis: [
        { name: '内容产出量', target: '100篇/月', current: '待建立' },
        { name: '自然搜索流量', target: '+50%', current: '基准值' },
        { name: '社交媒体粉丝', target: '+30%', current: '待统计' },
        { name: '线索转化率', target: '+20%', current: '待追踪' },
      ],
      contentThemes: [
        { theme: '产品核心价值', description: '深度解读产品功能与优势', priority: 'high' },
        { theme: '行业趋势洞察', description: '分享行业最新动态与分析', priority: 'high' },
        { theme: '用户成功案例', description: '展示真实客户使用效果', priority: 'medium' },
        { theme: '专业知识科普', description: '教育性内容建立专业形象', priority: 'medium' },
      ],
      contentTypeDistribution: [
        { type: '图文长文', percentage: 40, examples: ['深度评测', '行业报告'] },
        { type: '短视频', percentage: 30, examples: ['产品介绍', '使用教程'] },
        { type: '社交图文', percentage: 20, examples: ['海报', '金句'] },
        { type: '其他形式', percentage: 10, examples: ['直播', '问答'] },
      ],
      coreKeywords: (dto.keywords || ['品牌关键词']).map(k => ({
        keyword: k,
        searchVolume: '中等',
        difficulty: '中等',
        priority: 'high' as const,
      })),
      longTailKeywords: [
        { keyword: `${dto.brandName}怎么样`, intent: '品牌了解', opportunity: '高' },
        { keyword: `${dto.brandName}值得用吗`, intent: '产品评估', opportunity: '高' },
        { keyword: `${dto.brandName}和竞品对比`, intent: '对比决策', opportunity: '中' },
      ],
      platformPlan: this.generateDefaultPlatformPlan(dto),
      timeline: this.generateDefaultTimeline(dto.planningWeeks || 12),
      competitorAnalysis: dto.competitors ? [
        {
          competitor: dto.competitors.split(',')[0] || '主要竞品',
          strengths: ['品牌知名度高', '用户基数大'],
          weaknesses: ['价格偏高', '服务响应慢'],
          contentStrategy: '内容侧重产品功能对比',
          opportunity: '以性价比和服务取胜',
        },
      ] : undefined,
      recommendations: [
        '优先建立SEO内容壁垒，占领搜索流量入口',
        '深耕1-2个核心平台，形成标杆案例后再扩展',
        '建立用户案例库，用真实案例驱动转化',
        '保持内容更新频率，培养用户阅读习惯',
      ],
      risks: [
        { risk: '内容生产效率不足', probability: 'medium', mitigation: '建立内容模板库，提高复用率' },
        { risk: '平台算法变化', probability: 'medium', mitigation: '多平台分散风险，不依赖单一渠道' },
        { risk: '竞品快速跟进', probability: 'low', mitigation: '持续创新，保持内容差异化' },
      ],
      resourceRequirements: [
        { type: '内容编辑', quantity: '2人', cost: '1.5-2万/月' },
        { type: '设计师', quantity: '1人', cost: '1-1.5万/月' },
        { type: '视频制作', quantity: '1人', cost: '1.5-2万/月' },
        { type: '工具订阅', quantity: '-', cost: '2000-5000/月' },
      ],
    };
  }

  private getStrategyTypeName(type: StrategyType): string {
    const names: Record<StrategyType, string> = {
      [StrategyType.CONTENT]: '内容',
      [StrategyType.FAQ]: 'FAQ',
      [StrategyType.PRODUCT]: '产品',
      [StrategyType.COMPETITOR]: '竞品',
      [StrategyType.SEO]: 'SEO',
      [StrategyType.SOCIAL]: '社交媒体',
    };
    return names[type] || '综合';
  }

  private getPlatformName(platform: ContentPlatform): string {
    const names: Record<ContentPlatform, string> = {
      [ContentPlatform.WEBSITE]: '官网',
      [ContentPlatform.WECHAT]: '微信公众号',
      [ContentPlatform.WECHAT_MOMENTS]: '微信朋友圈',
      [ContentPlatform.WEIBO]: '微博',
      [ContentPlatform.DOUYIN]: '抖音',
      [ContentPlatform.XIAOHONGSHU]: '小红书',
      [ContentPlatform.BILIBILI]: 'B站',
      [ContentPlatform.BAIDU]: '百度',
      [ContentPlatform.TAOBAO]: '淘宝',
      [ContentPlatform.TMALL]: '天猫',
      [ContentPlatform.JD]: '京东',
    };
    return names[platform] || platform;
  }
}
