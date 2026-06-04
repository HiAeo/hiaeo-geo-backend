import { Controller, Get, Post, Param, Query, ParseIntPipe } from '@nestjs/common';
import { KnowledgeVersionService } from '../services/knowledge-version.service';
import { KnowledgeService } from '../services/knowledge.service';

@Controller('v1/knowledge')
export class KnowledgeVersionController {
  constructor(
    private readonly knowledgeVersionService: KnowledgeVersionService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  /**
   * 获取版本历史列表
   */
  @Get(':orgId/versions')
  async getVersionHistory(
    @Param('orgId') orgId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
  ) {
    const result = await this.knowledgeVersionService.getVersionHistory(orgId, page, size);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取指定版本快照
   */
  @Get(':orgId/versions/:version')
  async getVersionSnapshot(
    @Param('orgId') orgId: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    const snapshot = await this.knowledgeVersionService.getVersionSnapshot(orgId, version);
    return {
      success: !!snapshot,
      data: snapshot,
    };
  }

  /**
   * 版本对比
   */
  @Post(':orgId/versions/:v1/compare/:v2')
  async compareVersions(
    @Param('orgId') orgId: string,
    @Param('v1', ParseIntPipe) v1: number,
    @Param('v2', ParseIntPipe) v2: number,
  ) {
    const comparison = await this.knowledgeVersionService.compareVersions(orgId, v1, v2);
    return {
      success: !!comparison,
      data: comparison,
    };
  }

  /**
   * 版本回滚
   */
  @Post(':orgId/versions/:version/rollback')
  async rollbackToVersion(
    @Param('orgId') orgId: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    const knowledge = await this.knowledgeVersionService.rollbackToVersion(orgId, version);
    return {
      success: !!knowledge,
      data: knowledge,
      message: knowledge ? `已回滚到 v${version}` : '回滚失败',
    };
  }

  /**
   * 手动创建快照
   */
  @Post(':orgId/snapshot')
  async createSnapshot(@Param('orgId') orgId: string) {
    const knowledge = await this.knowledgeService.getKnowledgeBase(orgId);
    if (!knowledge) {
      return {
        success: false,
        message: '知识库不存在',
      };
    }

    const knowledgeEntity = await this.knowledgeService.getKnowledgeBase(orgId);
    const saved = await this.knowledgeVersionService.createSnapshot(orgId, knowledgeEntity as any);
    
    return {
      success: true,
      data: saved,
      message: `已创建快照 v${saved.version}`,
    };
  }
}
