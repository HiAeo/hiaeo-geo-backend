import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';

/**
 * 策略类型枚举
 */
export enum StrategyType {
  CONTENT = 'content',           // 内容策略
  FAQ = 'faq',                  // FAQ策略
  PRODUCT = 'product',           // 产品策略
  COMPETITOR = 'competitor',    // 竞品策略
  SEO = 'seo',                  // SEO策略
  SOCIAL = 'social',            // 社交媒体策略
}

/**
 * 内容平台枚举
 */
export enum ContentPlatform {
  WEBSITE = 'website',          // 官网
  WECHAT = 'wechat',            // 微信公众号
  WECHAT_MOMENTS = 'wechat_moments',  // 微信朋友圈
  WEIBO = 'weibo',              // 微博
  DOUYIN = 'douyin',            // 抖音
  XIAOHONGSHU = 'xiaohongshu',  // 小红书
  BILIBILI = 'bilibili',        // B站
  BAIDU = 'baidu',              // 百度
  TAOBAO = 'taobao',            // 淘宝
  TMALL = 'tmall',              // 天猫
  JD = 'jd',                    // 京东
}

/**
 * 生成模豆策略请求 DTO
 */
export class GenerateMofaStrategyDto {
  @ApiProperty({ description: '品牌名称', example: '魔鲸科技' })
  @IsString()
  brandName: string;

  @ApiPropertyOptional({ description: '品牌ID', example: 'brand_001' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiProperty({ description: '策略类型', enum: StrategyType, example: StrategyType.CONTENT })
  @IsEnum(StrategyType)
  strategyType: StrategyType;

  @ApiPropertyOptional({ description: '核心关键词', example: ['AI写作', '智能营销'] })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: '目标平台', type: [String], enum: ContentPlatform })
  @IsArray()
  @IsOptional()
  targetPlatforms?: ContentPlatform[];

  @ApiPropertyOptional({ description: '目标受众', example: '25-40岁企业管理者' })
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiPropertyOptional({ description: '竞争对手', example: '竞品A, 竞品B' })
  @IsString()
  @IsOptional()
  competitors?: string;

  @ApiPropertyOptional({ description: '产品/服务描述', example: 'AI驱动的智能内容生成平台' })
  @IsString()
  @IsOptional()
  productDescription?: string;

  @ApiPropertyOptional({ description: '行业领域', example: 'SaaS/企业服务' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ description: '预算范围', example: '10-50万/年' })
  @IsString()
  @IsOptional()
  budget?: string;

  @ApiPropertyOptional({ description: '计划周期（周）', example: 12, minimum: 1, maximum: 52 })
  @IsOptional()
  @Min(1)
  @Max(52)
  planningWeeks?: number;

  @ApiPropertyOptional({ description: '品牌优势', example: '技术领先, 用户体验好' })
  @IsString()
  @IsOptional()
  brandStrengths?: string;

  @ApiPropertyOptional({ description: '品牌挑战', example: '品牌认知度不高, 内容产出效率低' })
  @IsString()
  @IsOptional()
  brandChallenges?: string;
}

/**
 * 模豆策略内容结构
 */
export class MofaStrategyContent {
  // 策略概览
  @ApiProperty({ description: '策略摘要' })
  summary: string;

  @ApiProperty({ description: '核心目标' })
  coreObjectives: string[];

  @ApiProperty({ description: '关键绩效指标' })
  kpis: {
    name: string;
    target: string;
    current?: string;
  }[];

  // 内容策略
  @ApiProperty({ description: '内容主题建议' })
  contentThemes: {
    theme: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];

  @ApiProperty({ description: '内容类型分布' })
  contentTypeDistribution: {
    type: string;
    percentage: number;
    examples: string[];
  }[];

  // 关键词策略
  @ApiProperty({ description: '核心关键词' })
  coreKeywords: {
    keyword: string;
    searchVolume: string;
    difficulty: string;
    priority: 'high' | 'medium' | 'low';
  }[];

  @ApiProperty({ description: '长尾关键词' })
  longTailKeywords: {
    keyword: string;
    intent: string;
    opportunity: string;
  }[];

  // 平台策略
  @ApiProperty({ description: '平台执行计划' })
  platformPlan: {
    platform: ContentPlatform;
    contentTypes: string[];
    postingFrequency: string;
    keyMetrics: string[];
    budget: string;
  }[];

  // 时间线
  @ApiProperty({ description: '执行时间线' })
  timeline: {
    phase: string;
    duration: string;
    startWeek: number;
    endWeek: number;
    tasks: {
      task: string;
      deliverable: string;
      owner: string;
    }[];
    milestones: string[];
  }[];

  // 竞品分析
  @ApiPropertyOptional({ description: '竞品对比' })
  competitorAnalysis?: {
    competitor: string;
    strengths: string[];
    weaknesses: string[];
    contentStrategy: string;
    opportunity: string;
  }[];

  // 建议与风险
  @ApiProperty({ description: '执行建议' })
  recommendations: string[];

  @ApiProperty({ description: '潜在风险' })
  risks: {
    risk: string;
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
  }[];

  // 资源需求
  @ApiProperty({ description: '资源需求' })
  resourceRequirements: {
    type: string;
    quantity: string;
    cost: string;
  }[];
}

/**
 * 模豆策略结果 DTO
 */
export class MofaStrategyResultDto {
  @ApiProperty({ description: '策略ID' })
  id: string;

  @ApiProperty({ description: '策略名称' })
  name: string;

  @ApiProperty({ description: '策略类型', enum: StrategyType })
  type: StrategyType;

  @ApiProperty({ description: '品牌名称' })
  brandName: string;

  @ApiProperty({ description: '策略状态', enum: ['draft', 'active', 'completed'] })
  status: string;

  @ApiProperty({ description: '策略内容' })
  content: MofaStrategyContent;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 查询策略列表 DTO
 */
export class QueryMofaStrategyDto {
  @ApiPropertyOptional({ description: '品牌ID' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: '策略类型', enum: StrategyType })
  @IsEnum(StrategyType)
  @IsOptional()
  strategyType?: StrategyType;

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'active', 'completed'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  pageSize?: number;
}
