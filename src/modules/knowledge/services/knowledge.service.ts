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

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(BrandKnowledgeBase)
    private readonly knowledgeRepository: Repository<BrandKnowledgeBase>,
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
    // 检查是否已存在
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
      geoGoals: dto.geoGoals || {},
      version: 1,
    });

    const saved = await this.knowledgeRepository.save(knowledge);
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
      // 不存在则创建
      return this.createKnowledgeBase(organizationId, dto as CreateKnowledgeBaseDto);
    }

    // 记录变更字段
    const changedFields: string[] = [];

    // 合并更新
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
    this.logger.log(
      `Knowledge base updated for org ${organizationId}, version: ${knowledge.version}, changed fields: ${changedFields.join(', ')}`,
    );

    return this.mapToDto(saved);
  }

  /**
   * 上传文件（记录元信息）
   * 实际文件存储暂用本地路径，后续集成COS
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
      // 自动创建知识库
      const created = await this.createKnowledgeBase(organizationId, {});
      knowledge = await this.knowledgeRepository.findOne({
        where: { organizationId },
      });
      if (!knowledge) {
        throw new Error('知识库创建失败');
      }
    }

    const fileInfo = {
      fileId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.originalname,
      url: `/uploads/knowledge/${organizationId}/${module}/${file.originalname}`,
      uploadedAt: new Date().toISOString(),
    };

    // 更新fileIndex
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
      fileName: file.originalname,
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

    // 遍历所有文件数组，查找并删除
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
   * 获取版本历史
   */
  async getVersionHistory(
    organizationId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<{ list: KnowledgeVersionDto[]; total: number }> {
    // 简化版本：仅返回当前版本信息
    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return { list: [], total: 0 };
    }

    return {
      list: [
        {
          version: knowledge.version,
          updatedAt: knowledge.updatedAt,
          changedFields: [],
          versionRemark: knowledge.supplement?.versionRemark,
        },
      ],
      total: 1,
    };
  }

  /**
   * AI智能建议（模拟实现）
   */
  async getAiSuggestion(field: string, source?: string): Promise<AiSuggestResponseDto> {
    // TODO: 后续集成AI服务进行智能提取
    // 暂时返回模拟数据
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
