import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 发布平台枚举
 */
export enum PublishPlatform {
  WEBSITE = 'website',                    // 官网/CMS
  WECHAT = 'wechat',                      // 微信公众号
  WECHAT_MOMENTS = 'wechat_moments',      // 微信朋友圈
  WEIBO = 'weibo',                        // 微博
  DOUYIN = 'douyin',                      // 抖音
  XIAOHONGSHU = 'xiaohongshu',            // 小红书
  BILIBILI = 'bilibili',                  // B站
  BAIDU = 'baidu',                        // 百度
  TAOBAO = 'taobao',                      // 淘宝
  TMALL = 'tmall',                        // 天猫
  JD = 'jd',                              // 京东
  CUSTOM = 'custom',                      // 自定义/其他
}

/**
 * 内容类型枚举
 */
export enum PublishContentType {
  SEO_ARTICLE = 'seo_article',                    // SEO文章
  FAQ = 'faq',                                    // FAQ
  JSON_LD = 'json_ld',                           // JSON-LD
  PRODUCT_DESCRIPTION = 'product_description',   // 产品描述
  SOCIAL_POST = 'social_post',                   // 社交帖子
  VIDEO_SCRIPT = 'video_script',                 // 视频脚本
  AD_COPY = 'ad_copy',                           // 广告文案
}

/**
 * 发布状态枚举
 */
export enum PublishStatus {
  DRAFT = 'draft',               // 草稿
  PENDING = 'pending',           // 待发布
  PUBLISHING = 'publishing',     // 发布中
  PUBLISHED = 'published',       // 已发布
  FAILED = 'failed',             // 发布失败
  SCHEDULED = 'scheduled',       // 已排期
}

/**
 * 发布平台配置
 */
export class PlatformConfig {
  @ApiProperty({ description: '平台类型', enum: PublishPlatform })
  @IsEnum(PublishPlatform)
  platform: PublishPlatform;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '平台特定配置(JSON)' })
  @IsString()
  @IsOptional()
  config?: string;

  @ApiPropertyOptional({ description: '发布草稿还是正式发布' })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiPropertyOptional({ description: '排期发布时间(ISO格式)' })
  @IsString()
  @IsOptional()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: '分类/目录' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsUrl()
  @IsOptional()
  coverImage?: string;
}

/**
 * 内容发布请求 DTO
 */
export class PublishContentDto {
  @ApiProperty({ description: '内容标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '内容主体' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: '内容摘要/描述' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({ description: '内容类型', enum: PublishContentType })
  @IsEnum(PublishContentType)
  contentType: PublishContentType;

  @ApiPropertyOptional({ description: '关键词' })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: 'SEO元标题' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO元描述' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({ description: '目标平台', type: [PlatformConfig] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformConfig)
  targetPlatforms: PlatformConfig[];

  @ApiPropertyOptional({ description: '品牌ID' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: '原始内容ID' })
  @IsString()
  @IsOptional()
  sourceContentId?: string;

  @ApiPropertyOptional({ description: '附加数据(JSON)' })
  @IsString()
  @IsOptional()
  additionalData?: string;
}

/**
 * 批量发布请求 DTO
 */
export class BatchPublishDto {
  @ApiProperty({ description: '内容ID列表', type: [String] })
  @IsArray()
  contentIds: string[];

  @ApiProperty({ description: '目标平台', type: [PlatformConfig] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformConfig)
  targetPlatforms: PlatformConfig[];
}

/**
 * 发布结果 DTO
 */
export class PublishResultDto {
  @ApiProperty({ description: '发布记录ID' })
  id: string;

  @ApiProperty({ description: '内容标题' })
  title: string;

  @ApiProperty({ description: '发布状态', enum: PublishStatus })
  status: PublishStatus;

  @ApiProperty({ description: '平台发布结果' })
  platformResults: PlatformPublishResult[];

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '发布时间' })
  publishedAt?: Date;
}

/**
 * 平台发布结果
 */
export class PlatformPublishResult {
  @ApiProperty({ description: '平台', enum: PublishPlatform })
  platform: PublishPlatform;

  @ApiProperty({ description: '平台名称' })
  platformName: string;

  @ApiProperty({ description: '发布状态', enum: PublishStatus })
  status: PublishStatus;

  @ApiPropertyOptional({ description: '平台返回的消息' })
  message?: string;

  @ApiPropertyOptional({ description: '平台返回的内容ID' })
  platformContentId?: string;

  @ApiPropertyOptional({ description: '平台返回的URL' })
  platformUrl?: string;

  @ApiPropertyOptional({ description: '错误信息' })
  error?: string;

  @ApiPropertyOptional({ description: '发布时间' })
  publishedAt?: Date;
}

/**
 * 查询发布记录 DTO
 */
export class QueryPublishDto {
  @ApiPropertyOptional({ description: '品牌ID' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: '内容类型', enum: PublishContentType })
  @IsEnum(PublishContentType)
  @IsOptional()
  contentType?: PublishContentType;

  @ApiPropertyOptional({ description: '发布状态', enum: PublishStatus })
  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;

  @ApiPropertyOptional({ description: '平台', enum: PublishPlatform })
  @IsEnum(PublishPlatform)
  @IsOptional()
  platform?: PublishPlatform;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  pageSize?: number;
}

/**
 * 导出格式枚举
 */
export enum ExportFormat {
  TXT = 'txt',
  HTML = 'html',
  MD = 'md',
  JSON = 'json',
  DOCX = 'docx',
  PDF = 'pdf',
}

/**
 * 导出请求 DTO
 */
export class ExportContentDto {
  @ApiProperty({ description: '内容ID列表', type: [String] })
  @IsArray()
  contentIds: string[];

  @ApiProperty({ description: '导出格式', enum: ExportFormat, default: ExportFormat.TXT })
  @IsEnum(ExportFormat)
  @IsOptional()
  format?: ExportFormat;

  @ApiPropertyOptional({ description: '是否包含元数据' })
  @IsBoolean()
  @IsOptional()
  includeMetadata?: boolean;

  @ApiPropertyOptional({ description: '文件名' })
  @IsString()
  @IsOptional()
  fileName?: string;
}
