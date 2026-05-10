import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy, StrategyStatus, StrategyType } from '../entities/strategy.entity';
import { CreateStrategyDto, UpdateStrategyDto, GenerateStrategyFromReportDto } from '../dto/strategy.dto';
import { DiagnosisTaskService } from '../../diagnosis/services/diagnosis-task.service';

@Injectable()
export class StrategyService {
  constructor(
    @InjectRepository(Strategy)
    private strategyRepository: Repository<Strategy>,
    private diagnosisTaskService: DiagnosisTaskService,
  ) {}

  async getList(filters: { brandId?: string; status?: string; userId?: string }): Promise<{ list: Strategy[]; total: number }> {
    const queryBuilder = this.strategyRepository.createQueryBuilder('strategy');

    if (filters.brandId) {
      queryBuilder.andWhere('strategy.brandId = :brandId', { brandId: filters.brandId });
    }
    if (filters.status) {
      queryBuilder.andWhere('strategy.status = :status', { status: filters.status });
    }
    if (filters.userId) {
      queryBuilder.andWhere('strategy.userId = :userId', { userId: filters.userId });
    }

    queryBuilder.orderBy('strategy.createdAt', 'DESC');

    const [list, total] = await queryBuilder.getManyAndCount();
    return { list, total };
  }

  async getById(id: string): Promise<Strategy | null> {
    return this.strategyRepository.findOne({ where: { id } });
  }

  async create(dto: CreateStrategyDto): Promise<Strategy> {
    const strategy = this.strategyRepository.create({
      brandId: dto.brandId,
      userId: dto.userId || '',
      name: dto.name,
      type: dto.type || StrategyType.CONTENT,
      status: StrategyStatus.DRAFT,
      content: {
        objectives: [],
        keywords: dto.keywords || [],
        channels: dto.channels || ['search', 'social'],
        contentTypes: ['article'],
        timeline: [],
        recommendations: [],
        kpis: [],
      },
      diagnosisReportId: dto.diagnosisReportId,
      targetKeywords: dto.keywords,
      targetChannels: dto.channels,
    });

    return this.strategyRepository.save(strategy);
  }

  async generate(dto: any): Promise<Strategy> {
    const strategy = this.strategyRepository.create({
      brandId: dto.brandId || '',
      userId: dto.userId || '',
      name: dto.name || '新策略',
      type: dto.type || StrategyType.CONTENT,
      status: StrategyStatus.DRAFT,
      content: this.generateStrategyContent(dto),
      targetKeywords: dto.keywords,
      targetChannels: dto.channels,
    });

    return this.strategyRepository.save(strategy);
  }

  async generateFromDiagnosisReport(dto: GenerateStrategyFromReportDto): Promise<Strategy> {
    // 获取诊断报告
    const report = await this.diagnosisTaskService.getReportById(dto.diagnosisReportId, dto.userId);

    if (!report) {
      throw new NotFoundException('诊断报告不存在');
    }

    // 基于报告生成策略内容
    const strategyContent = this.generateStrategyFromReport(report);

    const strategy = this.strategyRepository.create({
      brandId: dto.brandId,
      userId: dto.userId || '',
      name: dto.name || `${report.brandName} GEO优化策略`,
      type: dto.type || StrategyType.MOFA,
      status: StrategyStatus.DRAFT,
      content: strategyContent,
      diagnosisReportId: dto.diagnosisReportId,
      summary: this.generateSummary(report),
      targetKeywords: this.extractKeywords(report),
    });

    return this.strategyRepository.save(strategy);
  }

  private generateStrategyFromReport(report: any): any {
    const issues = report.issues || [];
    const suggestions = report.suggestions || [];
    const dimensionScores = report.dimensionScores || [];

    // 按优先级排序建议
    const prioritizedSuggestions = suggestions
      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 10);

    // 生成时间线
    const timeline = [
      {
        phase: '第一阶段：基础优化',
        duration: '1-2周',
        tasks: [
          '修复高优先级问题',
          '完善技术SEO基础',
          '建立关键词策略'
        ],
        milestones: ['完成高优先级修复', '关键词库建立']
      },
      {
        phase: '第二阶段：内容建设',
        duration: '3-4周',
        tasks: [
          '产出高质量原创内容',
          '建立内容矩阵',
          '优化现有内容'
        ],
        milestones: ['内容矩阵建立', '内容覆盖率提升']
      },
      {
        phase: '第三阶段：持续优化',
        duration: '持续',
        tasks: [
          '效果监测与分析',
          '策略迭代优化',
          '竞品跟踪'
        ],
        milestones: ['KPI达标', '持续增长']
      }
    ];

    // 生成KPI
    const kpis = [
      { name: 'GEO健康分', target: 85, current: report.overallScore || 0 },
      { name: '关键词排名', target: 20, current: 0 },
      { name: '内容覆盖率', target: 80, current: 30 },
      { name: '外链数量', target: 50, current: 10 }
    ];

    return {
      objectives: [
        '提升GEO健康分至85分以上',
        '覆盖目标关键词搜索',
        '建立可持续的内容策略'
      ],
      keywords: this.extractKeywords(report),
      channels: ['搜索引擎', '社交媒体', '内容平台'],
      contentTypes: ['文章', '视频', '信息图'],
      timeline,
      recommendations: prioritizedSuggestions.map((s: any, index: number) => ({
        priority: index + 1,
        title: s.title || s.name,
        description: s.description || s.suggestion,
        expectedImpact: s.expectedImpact || '提升评分',
        effort: s.effort || 'medium'
      })),
      kpis
    };
  }

  private generateSummary(report: any): string {
    return `# ${report.brandName} GEO优化策略

## 当前状态
- 综合评分: ${report.overallScore}分
- 健康等级: ${report.healthLevel}/5
- 主要问题: ${(report.issues || []).length}个

## 优化目标
1. 提升GEO健康分至85分以上
2. 修复所有高优先级问题
3. 建立持续优化的内容策略

## 核心策略
- 技术SEO优化
- 内容质量提升
- 用户体验改善
`;
  }

  private extractKeywords(report: any): string[] {
    const keywords = new Set<string>();
    
    // 从报告中提取关键词
    const issues = report.issues || [];
    issues.forEach((issue: any) => {
      if (issue.title) keywords.add(issue.title);
    });

    const suggestions = report.suggestions || [];
    suggestions.forEach((s: any) => {
      if (s.title) keywords.add(s.title);
    });

    // 添加默认关键词
    keywords.add(report.brandName);
    
    return Array.from(keywords).slice(0, 20);
  }

  private generateStrategyContent(dto: any): any {
    return {
      objectives: ['提升品牌知名度', '优化搜索排名'],
      keywords: dto.keywords || [],
      channels: dto.channels || ['search', 'social'],
      contentTypes: dto.contentTypes || ['article', 'video'],
      timeline: [
        {
          phase: '第一阶段',
          duration: '1-2周',
          tasks: ['关键词研究', '竞品分析'],
          milestones: ['关键词库建立']
        },
        {
          phase: '第二阶段',
          duration: '3-4周',
          tasks: ['内容创作', '平台适配'],
          milestones: ['内容矩阵建立']
        },
        {
          phase: '第三阶段',
          duration: '持续',
          tasks: ['效果监测', '优化迭代'],
          milestones: ['KPI达标']
        }
      ],
      recommendations: [
        {
          priority: 1,
          title: '聚焦长尾关键词',
          description: '覆盖用户搜索意图',
          expectedImpact: '提升搜索可见性',
          effort: 'medium'
        },
        {
          priority: 2,
          title: '多渠道分发',
          description: '提升品牌曝光',
          expectedImpact: '扩大覆盖范围',
          effort: 'medium'
        },
        {
          priority: 3,
          title: '数据驱动优化',
          description: '定期分析调整',
          expectedImpact: '持续提升效果',
          effort: 'low'
        }
      ],
      kpis: [
        { name: 'GEO健康分', target: 85, current: 0 },
        { name: '关键词排名', target: 20, current: 0 },
        { name: '内容覆盖率', target: 80, current: 0 }
      ]
    };
  }

  async update(id: string, dto: UpdateStrategyDto): Promise<Strategy | null> {
    const strategy = await this.getById(id);
    if (!strategy) return null;

    Object.assign(strategy, dto);
    if (dto.content) {
      strategy.content = dto.content;
    }

    return this.strategyRepository.save(strategy);
  }

  async delete(id: string): Promise<boolean> {
    const strategy = await this.getById(id);
    if (!strategy) return false;

    await this.strategyRepository.remove(strategy);
    return true;
  }

  async execute(id: string): Promise<{ success: boolean; message: string; executionId?: string }> {
    const strategy = await this.getById(id);
    if (!strategy) {
      return { success: false, message: '策略不存在' };
    }

    strategy.status = StrategyStatus.ACTIVE;
    strategy.executionProgress = 0;
    await this.strategyRepository.save(strategy);

    return {
      success: true,
      message: '策略执行中...',
      executionId: `exe_${Date.now()}`
    };
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    await this.strategyRepository.update(id, {
      executionProgress: progress,
      status: progress >= 100 ? StrategyStatus.COMPLETED : StrategyStatus.ACTIVE
    });
  }
}
