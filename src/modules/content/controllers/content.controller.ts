import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContentService } from '../services/content.service';
import { ContentAuditService } from '../services/content-audit.service';
import { ContentGeneratorService, SeoArticleResult, FaqResult, JsonLdResult, ProductDescriptionResult } from '../services/content-generator.service';
import { CreateContentDto, QueryContentDto, GenerateSeoArticleDto, GenerateFaqDto, GenerateJsonLdDto, GenerateProductDescriptionDto } from '../dto/content-generation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('内容管理')
@ApiBearerAuth()
@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly auditService: ContentAuditService,
    private readonly generatorService: ContentGeneratorService,
  ) {}

  // ==================== 基础CRUD ====================

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

  // ==================== 内容生成 ====================

  @Post('generate/seo-article')
  @ApiOperation({ summary: '生成SEO文章' })
  async generateSeoArticle(@Body() dto: GenerateSeoArticleDto): Promise<SeoArticleResult> {
    return this.generatorService.generateSeoArticle(dto);
  }

  @Post('generate/faq')
  @ApiOperation({ summary: '生成FAQ问答' })
  async generateFaq(@Body() dto: GenerateFaqDto): Promise<FaqResult> {
    return this.generatorService.generateFaq(dto);
  }

  @Post('generate/json-ld')
  @ApiOperation({ summary: '生成JSON-LD结构化数据' })
  async generateJsonLd(@Body() dto: GenerateJsonLdDto): Promise<JsonLdResult> {
    return this.generatorService.generateJsonLd(dto);
  }

  @Post('generate/product-description')
  @ApiOperation({ summary: '生成产品描述' })
  async generateProductDescription(@Body() dto: GenerateProductDescriptionDto): Promise<ProductDescriptionResult> {
    return this.generatorService.generateProductDescription(dto);
  }

  @Post('optimize')
  @ApiOperation({ summary: '优化内容' })
  async optimizeContent(@Body() body: { content: string; type?: string }) {
    const optimized = await this.generatorService.optimizeContent(body.content, body.type);
    return { content: optimized };
  }

  @Post('check-sensitive')
  @ApiOperation({ summary: '检查敏感词' })
  async checkSensitiveWords(@Body() body: { content: string }) {
    return this.generatorService.checkSensitiveWords(body.content);
  }
}
