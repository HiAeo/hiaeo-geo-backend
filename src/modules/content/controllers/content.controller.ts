import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContentService } from '../services/content.service';
import { ContentAuditService } from '../services/content-audit.service';
import { ContentGeneratorService, SeoArticleResult, FaqResult, JsonLdResult, ProductDescriptionResult } from '../services/content-generator.service';
import { KnowledgeAwareContentService } from '../services/knowledge-aware-content.service';
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
    private readonly knowledgeAwareContentService: KnowledgeAwareContentService,
  ) {}

  // ==================== 知识库感知的内容生成 ====================

  /**
   * 基于知识库生成SEO文章
   * POST /api/v1/content/generate/seo-article/from-knowledge
   */
  @Post('generate/seo-article/from-knowledge')
  @ApiOperation({ summary: '基于知识库生成SEO文章' })
  async generateSeoArticleFromKnowledge(
    @Request() req: any,
    @Body() body: { keyword?: string },
  ) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const context = await this.knowledgeAwareContentService.buildSeoArticleContext(
      organizationId,
      body.keyword,
    );

    if (!context) {
      return {
        success: false,
        message: '知识库信息不完整，请先完善品牌知识库',
      };
    }

    const result = await this.generatorService.generateSeoArticle(context);

    // 检查内容合规性
    const checkResult = await this.knowledgeAwareContentService.checkContentAgainstKnowledge(
      organizationId,
      result.content,
    );

    return {
      success: true,
      data: result,
      warnings: checkResult.hasViolation ? checkResult.foundWords : [],
      context: {
        brandName: context.brandName,
        keyword: context.keyword,
      },
    };
  }

  /**
   * 基于知识库生成FAQ
   * POST /api/v1/content/generate/faq/from-knowledge
   */
  @Post('generate/faq/from-knowledge')
  @ApiOperation({ summary: '基于知识库生成FAQ问答' })
  async generateFaqFromKnowledge(
    @Request() req: any,
    @Body() body: { faqType?: 'product' | 'service' | 'brand' | 'general' },
  ) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const context = await this.knowledgeAwareContentService.buildFaqContext(
      organizationId,
      body.faqType || 'brand',
    );

    if (!context) {
      return {
        success: false,
        message: '知识库信息不完整，请先完善品牌知识库',
      };
    }

    const result = await this.generatorService.generateFaq(context);

    return {
      success: true,
      data: result,
      context: {
        brandName: context.name,
        faqType: context.faqType,
      },
    };
  }

  /**
   * 基于知识库生成产品描述
   * POST /api/v1/content/generate/product-description/from-knowledge
   */
  @Post('generate/product-description/from-knowledge')
  @ApiOperation({ summary: '基于知识库生成产品描述' })
  async generateProductDescriptionFromKnowledge(
    @Request() req: any,
    @Body() body: { productName?: string },
  ) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const context = await this.knowledgeAwareContentService.buildProductDescriptionContext(
      organizationId,
      body.productName,
    );

    if (!context) {
      return {
        success: false,
        message: '知识库缺少产品信息，请先完善产品服务详情',
      };
    }

    const result = await this.generatorService.generateProductDescription(context);

    return {
      success: true,
      data: result,
      context: {
        productName: context.productName,
        brandName: context.brandName,
      },
    };
  }

  /**
   * 检查内容与知识库合规性
   * POST /api/v1/content/check-with-knowledge
   */
  @Post('check-with-knowledge')
  @ApiOperation({ summary: '检查内容与知识库合规性' })
  async checkWithKnowledge(
    @Request() req: any,
    @Body() body: { content: string },
  ) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const result = await this.knowledgeAwareContentService.checkContentAgainstKnowledge(
      organizationId,
      body.content,
    );

    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取品牌摘要
   * GET /api/v1/content/brand-summary
   */
  @Get('brand-summary')
  @ApiOperation({ summary: '获取品牌摘要用于内容生成' })
  async getBrandSummary(@Request() req: any) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const summary = await this.knowledgeAwareContentService.getBrandSummary(organizationId);

    if (!summary) {
      return { success: false, message: '未找到知识库' };
    }

    return {
      success: true,
      data: summary,
    };
  }

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
