import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ContentType {
  SEO_ARTICLE = 'seo_article',
  FAQ = 'faq',
  JSON_LD = 'json_ld',
  PRODUCT_DESCRIPTION = 'product_description',
  SOCIAL_POST = 'social_post',
}

export class GenerateSeoArticleDto {
  @ApiProperty({ description: '品牌名称' })
  @IsString()
  brandName: string;

  @ApiProperty({ description: '核心关键词' })
  @IsString()
  keyword: string;

  @ApiPropertyOptional({ description: '长尾关键词（逗号分隔）' })
  @IsOptional()
  @IsString()
  longTailKeywords?: string;

  @ApiPropertyOptional({ description: '文章目标字数', default: 1500 })
  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(5000)
  targetWordCount?: number;

  @ApiPropertyOptional({ description: '品牌相关信息' })
  @IsOptional()
  @IsString()
  brandInfo?: string;

  @ApiPropertyOptional({ description: '竞争对手（逗号分隔）' })
  @IsOptional()
  @IsString()
  competitors?: string;
}

export class GenerateFaqDto {
  @ApiProperty({ description: '品牌/产品名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'FAQ类型', enum: ['product', 'service', 'brand', 'general'] })
  @IsEnum(['product', 'service', 'brand', 'general'])
  faqType: string;

  @ApiPropertyOptional({ description: '问题数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(20)
  questionCount?: number;

  @ApiPropertyOptional({ description: '目标用户描述' })
  @IsOptional()
  @IsString()
  targetAudience?: string;
}

export class GenerateJsonLdDto {
  @ApiProperty({ description: 'JSON-LD类型', enum: ['Organization', 'LocalBusiness', 'Product', 'Article', 'FAQPage', 'BreadcrumbList'] })
  @IsEnum(['Organization', 'LocalBusiness', 'Product', 'Article', 'FAQPage', 'BreadcrumbList'])
  schemaType: string;

  @ApiProperty({ description: '品牌/企业名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '网站URL' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: '联系邮箱' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ description: '社交媒体链接（JSON格式）' })
  @IsOptional()
  @IsString()
  socialLinks?: string;

  @ApiPropertyOptional({ description: '产品描述（Product类型必填）' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '产品价格（Product类型）' })
  @IsOptional()
  @IsString()
  price?: string;
}

export class GenerateProductDescriptionDto {
  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '产品类别' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: '产品特点（逗号分隔）' })
  @IsOptional()
  @IsString()
  features?: string;

  @ApiPropertyOptional({ description: '目标用户' })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({ description: '品牌名称' })
  @IsOptional()
  @IsString()
  brandName?: string;
}

export class CreateContentDto {
  @ApiProperty({ description: '内容标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '内容正文' })
  @IsString()
  body: string;

  @ApiProperty({ description: '内容类型', enum: ContentType })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiPropertyOptional({ description: '关联的品牌ID' })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ description: '元描述' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: '关键词' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ description: '标签（逗号分隔）' })
  @IsOptional()
  @IsString()
  tags?: string;
}

export class QueryContentDto {
  @ApiPropertyOptional({ description: '内容类型' })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @ApiPropertyOptional({ description: '品牌ID' })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
