import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContentService } from '../services/content.service';
import { ContentAuditService } from '../services/content-audit.service';
import { CreateContentDto } from '../dto/create-content.dto';
import { QueryContentDto } from '../dto/query-content.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('内容管理')
@ApiBearerAuth()
@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly auditService: ContentAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建内容' })
  async create(@Body() createContentDto: CreateContentDto, @Request() req: any) {
    const content = await this.contentService.create(createContentDto, req.user?.id || 'system');
    await this.auditService.logAction(content.id, req.user?.id || 'system', 'create');
    return content;
  }

  @Get()
  @ApiOperation({ summary: '查询内容列表' })
  async findAll(@Query() query: QueryContentDto) {
    return this.contentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取内容详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新内容' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateContentDto>,
    @Request() req: any,
  ) {
    const content = await this.contentService.update(id, updateData);
    await this.auditService.logAction(id, req.user?.id || 'system', 'update', updateData);
    return content;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除内容' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.contentService.remove(id);
    await this.auditService.logAction(id, req.user?.id || 'system', 'delete');
    return { message: '删除成功' };
  }
}
