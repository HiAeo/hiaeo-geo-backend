import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BrandService } from '../services/brand.service';

@ApiTags('品牌管理')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: '获取品牌列表' })
  async getList() {
    return this.brandService.getList();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取品牌详情' })
  async getById(@Param('id') id: string) {
    return this.brandService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建品牌' })
  async create(@Body() data: any) {
    return this.brandService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新品牌' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.brandService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除品牌' })
  async delete(@Param('id') id: string) {
    return this.brandService.delete(id);
  }
}
