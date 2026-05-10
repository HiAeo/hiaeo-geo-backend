import { IsString, IsOptional, IsEnum, IsUrl, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BrandIndustry, BrandStatus } from '../entities/brand.entity';

export class CreateBrandDto {
  @ApiProperty({ description: '品牌名称', example: '华为' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '品牌域名', example: 'huawei.com' })
  @IsString()
  @MaxLength(100)
  domain: string;

  @ApiPropertyOptional({ enum: BrandIndustry, description: '所属行业' })
  @IsOptional()
  @IsEnum(BrandIndustry)
  industry?: BrandIndustry;

  @ApiPropertyOptional({ description: '品牌描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '品牌Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'SEO数据' })
  @IsOptional()
  @IsObject()
  seoData?: {
    title?: string;
    description?: string;
    keywords?: string[];
    socialMedia?: {
      weibo?: string;
      wechat?: string;
      zhihu?: string;
      douyin?: string;
    };
  };

  @ApiPropertyOptional({ description: '联系方式' })
  @IsOptional()
  @IsObject()
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export class UpdateBrandDto {
  @ApiPropertyOptional({ description: '品牌名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '品牌域名' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  domain?: string;

  @ApiPropertyOptional({ enum: BrandIndustry, description: '所属行业' })
  @IsOptional()
  @IsEnum(BrandIndustry)
  industry?: BrandIndustry;

  @ApiPropertyOptional({ description: '品牌描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '品牌Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ enum: BrandStatus, description: '品牌状态' })
  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;

  @ApiPropertyOptional({ description: 'SEO数据' })
  @IsOptional()
  @IsObject()
  seoData?: {
    title?: string;
    description?: string;
    keywords?: string[];
    socialMedia?: {
      weibo?: string;
      wechat?: string;
      zhihu?: string;
      douyin?: string;
    };
  };

  @ApiPropertyOptional({ description: '联系方式' })
  @IsOptional()
  @IsObject()
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export class BrandQueryDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: BrandIndustry, description: '行业筛选' })
  @IsOptional()
  @IsEnum(BrandIndustry)
  industry?: BrandIndustry;

  @ApiPropertyOptional({ enum: BrandStatus, description: '状态筛选' })
  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;

  @ApiPropertyOptional({ description: '当前页码', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  limit?: number = 10;
}
