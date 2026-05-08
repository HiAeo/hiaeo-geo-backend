import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PackageService } from '../services/package.service';

@ApiTags('套餐')
@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Get()
  @ApiOperation({ summary: '获取套餐列表' })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: '返回套餐列表' })
  async getPackages(@Query('type') type?: string) {
    return this.packageService.getPackages(type);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取套餐详情' })
  @ApiResponse({ status: 200, description: '返回套餐详情' })
  async getPackageById(@Query('id') id: string) {
    return this.packageService.getPackageById(id);
  }
}
