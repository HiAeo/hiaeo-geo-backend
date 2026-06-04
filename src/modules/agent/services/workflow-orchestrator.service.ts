import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosisTaskService } from '../../diagnosis/services/diagnosis-task.service';
import { ReportGeneratorService } from '../../diagnosis/services/report-generator.service';
import { StrategyService } from '../../strategy/services/strategy.service';
import { ContentService } from '../../content/services/content.service';
import { StrategyType } from '../../strategy/entities/strategy.entity';
import { ContentStatus } from '../../content/dto/create-content.dto';
import { DiagnosisType } from '../../diagnosis/entities/diagnosis-task.entity';

/**
 * 工作流编排服务 - 协调各模块执行
 */
@Injectable()
export class WorkflowOrchestratorService {
  private readonly logger = new Logger(WorkflowOrchestratorService.name);

  constructor(
    private diagnosisTaskService: DiagnosisTaskService,
    private reportGeneratorService: ReportGeneratorService,
    private strategyService: StrategyService,
    private contentService: ContentService,
  ) {}

  /**
   * 执行诊断阶段
   */
  async executeDiagnosis(brandId: string): Promise<{
    success: boolean;
    taskId?: string;
    reportId?: string;
    error?: string;
  }> {
    try {
      this.logger.log(`开始诊断品牌: ${brandId}`);

      // 1. 创建诊断任务
      const task = await this.diagnosisTaskService.createTask('', {
        brandName: brandId,
        type: DiagnosisType.FULL,
        includeCompetitorAnalysis: true,
      });

      if (!task || !task.id) {
        throw new Error('创建诊断任务失败');
      }

      // 2. 执行诊断（异步，实际在后台运行）
      // 实际项目中应该使用消息队列，这里简化处理
      this.executeDiagnosisAsync(task.id);

      return {
        success: true,
        taskId: task.id,
        reportId: `report_${Date.now()}`, // 临时 ID
      };
    } catch (error) {
      this.logger.error(`诊断执行失败: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 异步执行诊断任务
   */
  private async executeDiagnosisAsync(taskId: string): Promise<void> {
    try {
      // 模拟异步执行
      await new Promise(resolve => setTimeout(resolve, 100));
      this.logger.log(`诊断任务 ${taskId} 已提交`);
    } catch (error) {
      this.logger.error(`诊断任务 ${taskId} 执行异常`, error);
    }
  }

  /**
   * 执行策略阶段
   */
  async executeStrategy(brandId: string, reportId?: string): Promise<{
    success: boolean;
    strategyId?: string;
    error?: string;
  }> {
    try {
      this.logger.log(`生成策略: ${brandId}`);

      // 1. 创建策略
      const strategy = await this.strategyService.create({
        brandId,
        userId: '',
        name: `GEO 优化策略 - ${new Date().toLocaleDateString('zh-CN')}`,
        type: StrategyType.CONTENT,
        diagnosisReportId: reportId,
      });

      if (!strategy || !strategy.id) {
        throw new Error('创建策略失败');
      }

      // 2. 模拟生成策略内容
      await this.generateStrategyContent(strategy.id);

      return {
        success: true,
        strategyId: strategy.id,
      };
    } catch (error) {
      this.logger.error(`策略生成失败: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 生成策略内容
   */
  private async generateStrategyContent(strategyId: string): Promise<void> {
    try {
      // 更新策略内容
      const content = {
        objectives: [
          '提升品牌在本地搜索中的排名',
          '增加地理位置相关关键词的曝光',
          '优化 Google My Business 信息',
        ],
        keywords: ['品牌名称 + 城市', '服务类型 + 位置', '长尾地理关键词'],
        channels: ['google', 'baidu', 'map'],
        contentTypes: ['location_pages', 'local_listings', 'geo_blog'],
        timeline: [
          { phase: '第一阶段', duration: '1-2周', tasks: ['关键词研究', '本地目录提交'] },
          { phase: '第二阶段', duration: '3-4周', tasks: ['内容优化', '地图优化'] },
          { phase: '第三阶段', duration: '持续', tasks: ['监控调整', '内容更新'] },
        ],
        recommendations: [
          '完善 Google My Business 信息',
          '获取本地高质量外链',
          '创建地理位置相关内容',
        ],
        kpis: [
          { name: '本地搜索排名', target: '前3名' },
          { name: '地图曝光', target: '+50%' },
          { name: '本地流量', target: '+30%' },
        ],
      };

      await this.strategyService.update(strategyId, {
        content,
        status: 'active',
      });

      this.logger.log(`策略 ${strategyId} 内容生成完成`);
    } catch (error) {
      this.logger.error(`策略内容生成失败`, error);
    }
  }

  /**
   * 执行内容阶段
   */
  async executeContent(brandId: string, strategyId: string): Promise<{
    success: boolean;
    contentIds?: string[];
    error?: string;
  }> {
    try {
      this.logger.log(`执行内容生成: ${brandId}`);

      // 1. 获取策略内容
      const strategy = await this.strategyService.getById(strategyId);
      if (!strategy) {
        throw new Error('策略不存在');
      }

      const contentIds: string[] = [];

      // 2. 根据策略生成内容
      const keywords = strategy.targetKeywords || [];
      const channels = strategy.targetChannels || ['search'];

      // 生成 3-5 条内容
      const contentCount = Math.min(Math.max(keywords.length, 3), 5);
      
      for (let i = 0; i < contentCount; i++) {
        const keyword = keywords[i] || `品牌关键词${i + 1}`;
        
        const content = await this.contentService.create({
          title: `${keyword} - 本地 SEO 优化指南`,
          body: this.generateSampleContent(keyword, strategy.name || ''),
          type: 'article',
          status: ContentStatus.DRAFT,
        }, strategy.userId || '');

        if (content && content.id) {
          contentIds.push(String(content.id));
        }
      }

      this.logger.log(`内容生成完成: ${contentIds.length} 条`);

      return {
        success: true,
        contentIds,
      };
    } catch (error) {
      this.logger.error(`内容生成失败: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 生成示例内容
   */
  private generateSampleContent(keyword: string, strategyName: string): string {
    return `
<h2>${keyword} 本地 SEO 优化指南</h2>

<p>在当今数字化时代，优化 ${keyword} 的本地搜索表现对于吸引周边客户至关重要。本文将详细介绍如何通过 GEO（地理搜索引擎优化）策略提升您的品牌在本地搜索结果中的排名。</p>

<h3>为什么 ${keyword} 本地 SEO 很重要？</h3>

<ul>
  <li>76% 的用户在本地搜索后 24 小时内到访</li>
  <li>本地搜索转化率比普通搜索高 50%</li>
  <li>移动端本地搜索占比超过 60%</li>
</ul>

<h3>${keyword} 优化关键步骤</h3>

<ol>
  <li><strong>完善商家信息</strong>：确保 Google My Business、百度商家等信息完整准确</li>
  <li><strong>关键词优化</strong>：在标题、描述、内容中合理使用 ${keyword}</li>
  <li><strong>本地内容创作</strong>：发布与地理位置相关的高质量内容</li>
  <li><strong>获取本地引用</strong>：在本地目录和网站建立引用</li>
</ol>

<h3>效果监控</h3>

<p>使用 Analytics 和 Search Console 监控 ${keyword} 相关指标的提升情况，持续优化策略。</p>

<p>如需了解更多优化技巧，请参考 ${strategyName}。</p>
    `.trim();
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(brandId: string): Promise<{
    currentStage: string;
    progress: number;
    diagnosis?: any;
    strategy?: any;
    execution?: any;
  }> {
    // 简化实现，返回默认状态
    return {
      currentStage: 'idle',
      progress: 0,
    };
  }
}
