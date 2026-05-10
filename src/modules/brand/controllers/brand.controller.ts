import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BrandService } from '../services/brand.service';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from '../dto/brand.dto';
import { Brand } from '../entities/brand.entity';

interface AuthenticatedRequest {
  user: {
    id: string;
    organizationId: string;
  };
}

@ApiTags('品牌管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: '获取品牌列表（支持分页筛选）' })
  @ApiResponse({ status: 200, description: '返回品牌列表' })
  async getList(@Query() query: BrandQueryDto, @Request() req: AuthenticatedRequest) {
    return this.brandService.getList(query, req.user.id, req.user.organizationId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取品牌统计信息' })
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.brandService.getStats(req.user.organizationId);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的品牌' })
  async getMyBrands(@Request() req: AuthenticatedRequest) {
    return this.brandService.getByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取品牌详情' })
  @ApiResponse({ status: 200, description: '返回品牌详情' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  async getById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.brandService.getById(id, req.user.organizationId);
  }

  @Get(':id/seo')
  @ApiOperation({ summary: '获取品牌SEO数据' })
  async getSeoData(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.brandService.getSeoData(id, req.user.organizationId);
  }

  @Put(':id/seo')
  @ApiOperation({ summary: '更新品牌SEO数据' })
  async updateSeoData(
    @Param('id') id: string,
    @Body('seoData') seoData: Brand['seoData'],
    @Request() req: AuthenticatedRequest,
  ) {
    return this.brandService.updateSeoData(id, seoData, req.user.organizationId);
  }

  @Get(':id/social')
  @ApiOperation({ summary: '获取品牌社交媒体配置' })
  async getSocialMedia(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.brandService.getSocialMedia(id, req.user.organizationId);
  }

  @Put(':id/social')
  @ApiOperation({ summary: '更新品牌社交媒体配置' })
  async updateSocialMedia(
    @Param('id') id: string,
    @Body() body: { weibo?: string; wechat?: string; zhihu?: string; douyin?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.brandService.updateSocialMedia(id, body, req.user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: '创建品牌' })
  @ApiResponse({ status: 201, description: '品牌创建成功' })
  @ApiResponse({ status: 400, description: '参数错误或品牌数量已达上限' })
  async create(@Body() dto: CreateBrandDto, @Request() req: AuthenticatedRequest) {
    return this.brandService.create(dto, req.user.id, req.user.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新品牌' })
  @ApiResponse({ status: 200, description: '品牌更新成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto, @Request() req: AuthenticatedRequest) {
    return this.brandService.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除品牌（软删除）' })
  @ApiResponse({ status: 200, description: '品牌删除成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.brandService.delete(id, req.user.organizationId);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '永久删除品牌（仅管理员）' })
  @ApiResponse({ status: 200, description: '品牌永久删除成功' })
  @ApiResponse({ status: 403, description: '无权限' })
  async hardDelete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.brandService.hardDelete(id, req.user.organizationId);
  }
}
