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
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission, KnowledgeAccess } from '../../auth/decorators/permission.decorator';
import { KnowledgeService } from '../services/knowledge.service';
import { EnhancedAiSuggestionService } from '../services/enhanced-ai-suggestion.service';
import { IncrementalDiagnosisTriggerService } from '../services/incremental-diagnosis-trigger.service';
import { VectorStorageService } from '../services/vector-storage.service';
import {
  CreateKnowledgeBaseDto,
  UpdateKnowledgeBaseDto,
  AiSuggestDto,
  EnhancedFieldSuggestionDto,
  ExtractFromUrlDto,
  ExtractFromTextDto,
  ManualTriggerDiagnosisDto,
  SemanticSearchDto,
} from '../dto/knowledge.dto';
import { PERMISSIONS } from '../../auth/constants/permissions.constant';

@Controller('v1/knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly aiSuggestionService: EnhancedAiSuggestionService,
    private readonly diagnosisTriggerService: IncrementalDiagnosisTriggerService,
    private readonly vectorStorageService: VectorStorageService,
  ) {}

  /**
   * 获取知识库
   * GET /api/v1/knowledge/profile
   */
  @Get('profile')
  async getProfile(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return { data: null };
    }

    const knowledge = await this.knowledgeService.getKnowledgeBase(organizationId);
    return { data: knowledge };
  }

  /**
   * 创建知识库
   * POST /api/v1/knowledge/profile
   * 需要 KNOWLEDGE_WRITE 权限
   */
  @Post('profile')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.KNOWLEDGE_WRITE)
  async createProfile(
    @Request() req: any,
    @Body() dto: CreateKnowledgeBaseDto,
  ) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const knowledge = await this.knowledgeService.createKnowledgeBase(organizationId, dto);
    return { success: true, data: knowledge };
  }

  /**
   * 更新知识库
   * PUT /api/v1/knowledge/profile
   * 需要 KNOWLEDGE_WRITE 权限
   */
  @Put('profile')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.KNOWLEDGE_WRITE)
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateKnowledgeBaseDto,
  ) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const knowledge = await this.knowledgeService.updateKnowledgeBase(organizationId, dto);
    return {
      success: true,
      data: {
        version: knowledge.version,
        updatedAt: knowledge.updatedAt,
      },
    };
  }

  /**
   * 上传文件
   * POST /api/v1/knowledge/upload
   * 需要 KNOWLEDGE_WRITE 权限
   */
  @Post('upload')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.KNOWLEDGE_WRITE)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: any,
    @Body('module') module: string,
  ) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    if (!file) {
      return { success: false, message: '请上传文件' };
    }

    const result = await this.knowledgeService.uploadFile(
      organizationId,
      module || 'default',
      file,
    );

    return { success: true, data: result };
  }

  /**
   * 删除文件
   * DELETE /api/v1/knowledge/file/:fileId
   * 需要 KNOWLEDGE_DELETE 权限
   */
  @Delete('file/:fileId')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.KNOWLEDGE_DELETE)
  async deleteFile(@Request() req: any, @Param('fileId') fileId: string) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return { success: false, message: '未找到组织信息' };
    }

    const deleted = await this.knowledgeService.deleteFile(organizationId, fileId);
    return { success: deleted };
  }

  /**
   * 获取版本历史
   * GET /api/v1/knowledge/history
   */
  @Get('history')
  async getHistory(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return { data: { list: [], total: 0 } };
    }

    const result = await this.knowledgeService.getVersionHistory(
      organizationId,
      parseInt(page, 10),
      parseInt(size, 10),
    );

    return { data: result };
  }

  /**
   * AI智能建议
   * POST /api/v1/knowledge/ai-suggest
   */
  @Post('ai-suggest')
  async getAiSuggestion(@Body() dto: AiSuggestDto) {
    const result = await this.knowledgeService.getAiSuggestion(
      dto.field,
      dto.sourceUrl || dto.sourceText,
    );
    return { data: result };
  }

  // ========== Phase 3: AI 联动 API ==========

  /**
   * 增强的字段建议
   * POST /api/v1/knowledge/ai-suggest/field
   */
  @Post('ai-suggest/field')
  async getEnhancedFieldSuggestion(
    @Request() req: any,
    @Body() dto: EnhancedFieldSuggestionDto,
  ) {
    const organizationId = req.user?.organizationId;
    const result = await this.aiSuggestionService.getFieldSuggestion(
      organizationId,
      dto.field,
    );
    return { data: result };
  }

  /**
   * 从URL提取信息
   * POST /api/v1/knowledge/ai-extract/url
   */
  @Post('ai-extract/url')
  async extractFromUrl(@Request() req: any, @Body() dto: ExtractFromUrlDto) {
    const organizationId = req.user?.organizationId;
    const result = await this.aiSuggestionService.extractFromUrl(
      organizationId,
      dto.url,
      dto.targetField,
    );
    return { data: result };
  }

  /**
   * 从文本提取信息
   * POST /api/v1/knowledge/ai-extract/text
   */
  @Post('ai-extract/text')
  async extractFromText(@Request() req: any, @Body() dto: ExtractFromTextDto) {
    const organizationId = req.user?.organizationId;
    const result = await this.aiSuggestionService.extractFromText(
      organizationId,
      dto.text,
      dto.targetFields,
    );
    return { data: result };
  }

  /**
   * 知识库完整度报告
   * GET /api/v1/knowledge/completeness
   */
  @Get('completeness')
  async getCompletenessReport(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    const result = await this.aiSuggestionService.generateCompletenessReport(
      organizationId,
    );
    return { data: result };
  }

  /**
   * 关键词建议
   * GET /api/v1/knowledge/keywords
   */
  @Get('keywords')
  async getKeywordSuggestions(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    const result = await this.aiSuggestionService.suggestKeywords(organizationId);
    return { data: result };
  }

  /**
   * 增量诊断触发状态检查
   * GET /api/v1/knowledge/diagnosis-suggest
   */
  @Get('diagnosis-suggest')
  async getDiagnosisSuggestion(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    const result = await this.diagnosisTriggerService.shouldSuggestDiagnosis(
      organizationId,
    );
    return { data: result };
  }

  /**
   * 手动触发增量诊断
   * POST /api/v1/knowledge/diagnosis-trigger
   */
  @Post('diagnosis-trigger')
  async triggerIncrementalDiagnosis(
    @Request() req: any,
    @Body() dto: ManualTriggerDiagnosisDto,
  ) {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;
    const taskId = await this.diagnosisTriggerService.manualTrigger(
      organizationId,
      userId,
      dto.dimensions,
    );
    return { success: true, taskId };
  }

  /**
   * 语义搜索
   * POST /api/v1/knowledge/search
   */
  @Post('search')
  async semanticSearch(@Request() req: any, @Body() dto: SemanticSearchDto) {
    const organizationId = req.user?.organizationId;
    const result = await this.vectorStorageService.semanticSearch(
      organizationId,
      dto.query,
      dto.topK || 5,
    );
    return { data: result };
  }

  /**
   * 重建向量索引
   * POST /api/v1/knowledge/index
   */
  @Post('index')
  async rebuildIndex(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    const result = await this.vectorStorageService.indexKnowledgeBase(organizationId);
    return { success: true, ...result };
  }

  /**
   * 获取向量索引状态
   * GET /api/v1/knowledge/index
   */
  @Get('index')
  async getIndexStatus(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    const result = await this.vectorStorageService.getIndexStatus(organizationId);
    return { data: result };
  }

  /**
   * 查找相似知识库
   * GET /api/v1/knowledge/similar
   */
  @Get('similar')
  async findSimilarKnowledgeBases(
    @Request() req: any,
    @Query('topK') topK: string = '5',
  ) {
    const organizationId = req.user?.organizationId;
    const result = await this.vectorStorageService.findSimilarKnowledgeBases(
      organizationId,
      parseInt(topK, 10),
    );
    return { data: result };
  }
}
