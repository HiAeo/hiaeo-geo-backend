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
import { RolesGuard } from '../../auth/guards/admin.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PackageAdminService, CreatePackageDto, UpdatePackageDto } from '../services/package-admin.service';
import { Package, PackageStatus } from '../entities/package.entity';

@ApiTags('套餐管理 (管理员)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/packages')
export class PackageAdminController {
  constructor(private readonly packageAdminService: PackageAdminService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '获取所有套餐列表' })
  @ApiResponse({ status: 200, description: '返回套餐列表' })
  async getAllPackages(@Query('includeArchived') includeArchived?: string) {
    const packages = await this.packageAdminService.getAllPackages(includeArchived === 'true');
    return {
      success: true,
      data: packages,
      total: packages.length,
    };
  }

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: '获取套餐统计' })
  async getStats() {
    return this.packageAdminService.getPackageStats();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: '获取套餐详情' })
  @ApiResponse({ status: 200, description: '返回套餐详情' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  async getPackageById(@Param('id') id: string) {
    return this.packageAdminService.getPackageById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建套餐' })
  @ApiResponse({ status: 201, description: '套餐创建成功' })
  @ApiResponse({ status: 400, description: '参数错误或套餐名称已存在' })
  async createPackage(@Body() dto: CreatePackageDto, @Request() req: any) {
    const pkg = await this.packageAdminService.createPackage(dto, req.user?.id);
    return {
      success: true,
      data: pkg,
      message: '套餐创建成功',
    };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: '更新套餐' })
  @ApiResponse({ status: 200, description: '套餐更新成功' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  async updatePackage(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    const pkg = await this.packageAdminService.updatePackage(id, dto);
    return {
      success: true,
      data: pkg,
      message: '套餐更新成功',
    };
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: '更新套餐状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  async updateStatus(@Param('id') id: string, @Body('status') status: PackageStatus) {
    const pkg = await this.packageAdminService.updatePackageStatus(id, status);
    return {
      success: true,
      data: pkg,
      message: '状态更新成功',
    };
  }

  @Put(':id/recommended')
  @Roles('admin')
  @ApiOperation({ summary: '设置推荐套餐' })
  @ApiResponse({ status: 200, description: '推荐设置成功' })
  async setRecommended(@Param('id') id: string, @Body('recommended') recommended: boolean) {
    const pkg = await this.packageAdminService.setRecommended(id, recommended);
    return {
      success: true,
      data: pkg,
      message: recommended ? '已设为推荐套餐' : '已取消推荐',
    };
  }

  @Put('reorder')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重新排序套餐' })
  @ApiResponse({ status: 200, description: '排序更新成功' })
  async reorderPackages(@Body('orderedIds') orderedIds: string[]) {
    const packages = await this.packageAdminService.reorderPackages(orderedIds);
    return {
      success: true,
      data: packages,
      message: '排序更新成功',
    };
  }

  @Post(':id/duplicate')
  @Roles('admin')
  @ApiOperation({ summary: '复制套餐' })
  @ApiResponse({ status: 201, description: '套餐复制成功' })
  async duplicatePackage(@Param('id') id: string, @Body('newName') newName: string) {
    const pkg = await this.packageAdminService.duplicatePackage(id, newName);
    return {
      success: true,
      data: pkg,
      message: '套餐复制成功',
    };
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除套餐（归档）' })
  @ApiResponse({ status: 200, description: '套餐已归档' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  async deletePackage(@Param('id') id: string) {
    return this.packageAdminService.deletePackage(id);
  }

  @Delete(':id/permanent')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '永久删除套餐' })
  @ApiResponse({ status: 200, description: '套餐已永久删除' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  async hardDeletePackage(@Param('id') id: string) {
    return this.packageAdminService.hardDeletePackage(id);
  }
}
