import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeVersion } from '../entities/knowledge-version.entity';
import { BrandKnowledgeBase } from '../entities/brand-knowledge-base.entity';
import { KnowledgeVersionDto, VersionComparisonDto } from '../dto/knowledge.dto';

@Injectable()
export class KnowledgeVersionService {
  private readonly logger = new Logger(KnowledgeVersionService.name);

  constructor(
    @InjectRepository(KnowledgeVersion)
    private readonly versionRepository: Repository<KnowledgeVersion>,
    @InjectRepository(BrandKnowledgeBase)
    private readonly knowledgeRepository: Repository<BrandKnowledgeBase>,
  ) {}

  /**
   * 创建版本快照
   */
  async createSnapshot(
    organizationId: string,
    knowledge: BrandKnowledgeBase,
    changedFields?: string[],
  ): Promise<KnowledgeVersion> {
    const snapshot = this.versionRepository.create({
      organizationId,
      version: knowledge.version,
      basicInfo: knowledge.basicInfo || {},
      bizPositioning: knowledge.bizPositioning || {},
      productService: knowledge.productService || {},
      competitorMarket: knowledge.competitorMarket || {},
      geoGoals: knowledge.geoGoals || {},
      supplement: knowledge.supplement || {},
      fileIndex: knowledge.fileIndex || {},
      versionRemark: knowledge.supplement?.versionRemark,
      changedFields: changedFields?.join(',') || 'initial',
      diagnosisScore: knowledge.lastDiagnosisScore,
    });

    const saved = await this.versionRepository.save(snapshot);
    this.logger.log(`创建知识库版本快照: v${saved.version} for org ${organizationId}`);
    return saved;
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory(
    organizationId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<{ list: KnowledgeVersionDto[]; total: number }> {
    const [versions, total] = await this.versionRepository.findAndCount({
      where: { organizationId },
      order: { version: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      list: versions.map(v => this.mapToDto(v)),
      total,
    };
  }

  /**
   * 获取指定版本快照
   */
  async getVersionSnapshot(organizationId: string, version: number): Promise<KnowledgeVersionDto | null> {
    const snapshot = await this.versionRepository.findOne({
      where: { organizationId, version },
    });

    return snapshot ? this.mapToDto(snapshot) : null;
  }

  /**
   * 版本对比
   */
  async compareVersions(
    organizationId: string,
    v1: number,
    v2: number,
  ): Promise<VersionComparisonDto | null> {
    const [version1, version2] = await Promise.all([
      this.versionRepository.findOne({ where: { organizationId, version: v1 } }),
      this.versionRepository.findOne({ where: { organizationId, version: v2 } }),
    ]);

    if (!version1 || !version2) {
      return null;
    }

    const comparisons = this.diffKnowledgeVersions(version1, version2);

    return {
      version1: this.mapToDto(version1),
      version2: this.mapToDto(version2),
      comparisons,
    };
  }

  /**
   * 版本回滚
   */
  async rollbackToVersion(organizationId: string, version: number): Promise<BrandKnowledgeBase | null> {
    const snapshot = await this.versionRepository.findOne({
      where: { organizationId, version },
    });

    if (!snapshot) {
      return null;
    }

    const knowledge = await this.knowledgeRepository.findOne({
      where: { organizationId },
    });

    if (!knowledge) {
      return null;
    }

    // 恢复数据
    knowledge.basicInfo = snapshot.basicInfo;
    knowledge.bizPositioning = snapshot.bizPositioning;
    knowledge.productService = snapshot.productService;
    knowledge.competitorMarket = snapshot.competitorMarket;
    knowledge.geoGoals = snapshot.geoGoals;
    knowledge.supplement = snapshot.supplement;
    knowledge.fileIndex = snapshot.fileIndex;
    knowledge.version += 1;

    const saved = await this.knowledgeRepository.save(knowledge);

    // 创建新快照记录回滚
    await this.createSnapshot(organizationId, saved, ['rollback']);

    this.logger.log(`知识库回滚到 v${version} for org ${organizationId}`);

    return saved;
  }

  /**
   * 删除旧版本（保留最近N个版本）
   */
  async pruneOldVersions(organizationId: string, keepCount: number = 10): Promise<number> {
    const versions = await this.versionRepository.find({
      where: { organizationId },
      order: { version: 'DESC' },
      skip: keepCount,
    });

    if (versions.length === 0) {
      return 0;
    }

    const idsToDelete = versions.map(v => v.id);
    await this.versionRepository.delete(idsToDelete);

    this.logger.log(`删除 ${idsToDelete.length} 个旧版本 for org ${organizationId}`);
    return idsToDelete.length;
  }

  /**
   * 对比两个版本
   */
  private diffKnowledgeVersions(v1: KnowledgeVersion, v2: KnowledgeVersion): any[] {
    const comparisons: any[] = [];

    const fields = [
      { key: 'basicInfo', label: '企业基础信息' },
      { key: 'bizPositioning', label: '核心业务与定位' },
      { key: 'productService', label: '产品与服务详情' },
      { key: 'competitorMarket', label: '竞品与市场信息' },
      { key: 'geoGoals', label: 'GEO推广目标' },
      { key: 'supplement', label: '补充信息' },
    ];

    for (const field of fields) {
      const data1 = (v1 as any)[field.key];
      const data2 = (v2 as any)[field.key];
      
      if (JSON.stringify(data1) !== JSON.stringify(data2)) {
        comparisons.push({
          field: field.key,
          label: field.label,
          before: data1,
          after: data2,
        });
      }
    }

    return comparisons;
  }

  /**
   * 映射到DTO
   */
  private mapToDto(version: KnowledgeVersion): KnowledgeVersionDto {
    return {
      version: version.version,
      updatedAt: version.createdAt,
      changedFields: version.changedFields?.split(',').filter(Boolean) || [],
      versionRemark: version.versionRemark,
      diagnosisScore: version.diagnosisScore,
    };
  }
}
