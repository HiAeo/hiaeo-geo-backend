import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import {
  CreateKnowledgeBaseDto,
  UpdateKnowledgeBaseDto,
  GetKnowledgeBaseDto,
  FileUploadResponseDto,
  KnowledgeVersionDto,
  AiSuggestResponseDto,
} from '../dto/knowledge.dto';
import { KnowledgeVersionService } from './knowledge-version.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private readonly knowledgeRepository: Repository<BrandKnowledgeBase>,
    private readonly knowledgeVersionService: KnowledgeVersionService,
  ) {}

  /**
   * 获取当前组织的知识库
   */
  async getKnowledgeBase(organizationId: string): Promise<GetKnowledgeBaseDto | null> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return null;
    }

    return this.mapToDto(knowledge);
  }

  /**
   * 创建知识库
   */
  async createKnowledgeBase(
    organizationId: string,
    dto: CreateKnowledgeBaseDto,
  ): Promise<GetKnowledgeBaseDto> {
    const existing = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (existing) {
      return this.updateKnowledgeBase(organizationId, dto as UpdateKnowledgeBaseDto);
    }

    const knowledge = this.knowledgeRepository.create({
      organizationId,
      basicInfo: dto.basicInfo || {},
      bizPositioning: dto.bizPositioning || {},
      productService: dto.productService || {},
      competitorMarket: dto.competitorMarket || {},
      geoGoals: dto.geoGoals || {},
      supplement: dto.supplement || {},
      fileIndex: {},
      version: 1,
    });

    const saved = await this.knowledgeRepository.save(knowledge);
    
    // 创建初始版本快照
    await this.knowledgeVersionService.createSnapshot(organizationId, saved);
    
    return this.mapToDto(saved);
  }

  /**
   * 更新知识库（整体或部分）
   */
  async updateKnowledgeBase(
    organizationId: string,
    dto: UpdateKnowledgeBaseDto,
  ): Promise<GetKnowledgeBaseDto> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return this.createKnowledgeBase(organizationId, dto as CreateKnowledgeBaseDto);
    }

    // 记录变更字段
    const changedFields: string[] = [];

    if (dto.basicInfo !== undefined) {
      knowledge.basicInfo = { ...knowledge.basicInfo, ...dto.basicInfo };
      changedFields.push('basicInfo');
    }
    if (dto.bizPositioning !== undefined) {
      knowledge.bizPositioning = { ...knowledge.bizPositioning, ...dto.bizPositioning };
      changedFields.push('bizPositioning');
    }
    if (dto.productService !== undefined) {
      knowledge.productService = { ...knowledge.productService, ...dto.productService };
      changedFields.push('productService');
    }
    if (dto.competitorMarket !== undefined) {
      knowledge.competitorMarket = { ...knowledge.competitorMarket, ...dto.competitorMarket };
      changedFields.push('competitorMarket');
    }
    if (dto.geoGoals !== undefined) {
      knowledge.geoGoals = { ...knowledge.geoGoals, ...dto.geoGoals };
      changedFields.push('geoGoals');
    }
    if (dto.supplement !== undefined) {
      knowledge.supplement = { ...knowledge.supplement, ...dto.supplement };
      changedFields.push('supplement');
    }

    // 版本号递增
    knowledge.version += 1;

    const saved = await this.knowledgeRepository.save(knowledge);
    
    // 创建版本快照
    await this.knowledgeVersionService.createSnapshot(organizationId, saved, changedFields);
    
    this.logger.log(
      `Knowledge base updated for org ${organizationId}, version: ${knowledge.version}, changed fields: ${changedFields.join(', ')}`,
    );

    return this.mapToDto(saved);
  }

  /**
   * 上传文件
   */
  async uploadFile(
    organizationId: string,
    module: string,
    file: any,
  ): Promise<FileUploadResponseDto> {
    let knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      const created = await this.createKnowledgeBase(organizationId, {});
      knowledge = await this.knowledgeRepository.findOne({
        where: { organizationId },
      });
      if (!knowledge) {
        throw new Error('知识库创建失败');
      }
    }

    // 处理中文文件名乱码：Multer 默认使用 Latin-1 解码，需要转回 UTF-8
    let originalName = file.originalname;
    try {
      // 如果文件名是 Latin-1 编码的中文，尝试转回 UTF-8
      if (/[\u00c0-\u00ff]/.test(originalName) || originalName.includes('Ã')) {
        const bytes = Array.from(originalName).map((c: string) => c.charCodeAt(0));
        originalName = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
      }
    } catch {
      // 解码失败则使用原文件名
    }

    const fileInfo = {
      fileId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: originalName,
      url: `/uploads/knowledge/${organizationId}/${module}/${originalName}`,
      uploadedAt: new Date().toISOString(),
    };

    const fileIndex = knowledge.fileIndex || {};
    if (!fileIndex[module]) {
      (fileIndex as any)[module] = [];
    }
    (fileIndex[module] as any[]).push(fileInfo);
    knowledge.fileIndex = fileIndex;
    knowledge.version += 1;

    await this.knowledgeRepository.save(knowledge);

    return {
      fileId: fileInfo.fileId,
      url: fileInfo.url,
      status: 'uploaded',
      fileName: originalName,
      fileSize: file.size,
    };
  }

  /**
   * 删除文件
   */
  async deleteFile(organizationId: string, fileId: string): Promise<boolean> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge || !knowledge.fileIndex) {
      return false;
    }

    let found = false;
    const fileIndex: any = { ...knowledge.fileIndex };

    for (const module of Object.keys(fileIndex)) {
      const files = fileIndex[module] || [];
      if (!Array.isArray(files)) continue;
      const index = files.findIndex((f: any) => f.fileId === fileId);
      if (index !== -1) {
        files.splice(index, 1);
        fileIndex[module] = files;
        found = true;
        break;
      }
    }

    if (found) {
      knowledge.fileIndex = fileIndex;
      knowledge.version += 1;
      await this.knowledgeRepository.save(knowledge);
      return true;
    }

    return false;
  }

  /**
   * 获取版本历史（使用版本服务）
   */
  async getVersionHistory(
    organizationId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<{ list: KnowledgeVersionDto[]; total: number }> {
    return this.knowledgeVersionService.getVersionHistory(organizationId, page, size);
  }

  /**
   * AI智能建议
   */
  async getAiSuggestion(field: string, source?: string): Promise<AiSuggestResponseDto> {
    const suggestions: Record<string, string> = {
      companyName: '建议填写公司全称，便于AI精准匹配',
      industry: '建议填写所属行业，如：科技、教育、医疗等',
      coreBizIntro: '建议用一句话概括核心业务，突出差异化价值',
      targetCustomer: '越具体越好，如：ToB-中大型企业-IT部门',
    };

    return {
      suggestion: suggestions[field] || '请填写相关信息，AI将基于此生成更精准的诊断和策略',
      confidence: 0.85,
      matchedFields: [field],
    };
  }

  /**
   * 映射实体到DTO
   */
  private mapToDto(entity: BrandKnowledgeBase): GetKnowledgeBaseDto {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      basicInfo: entity.basicInfo,
      bizPositioning: entity.bizPositioning,
      productService: entity.productService,
      competitorMarket: entity.competitorMarket,
      geoGoals: entity.geoGoals,
      fileIndex: entity.fileIndex,
      supplement: entity.supplement,
      lastDiagnosisRefresh: entity.lastDiagnosisRefresh,
    };
  }
}
