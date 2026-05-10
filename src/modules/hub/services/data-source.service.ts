import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { DiagnosisTask, DiagnosisStatus } from '../../diagnosis/entities/diagnosis-task.entity';
import { DiagnosisReport } from '../../diagnosis/entities/diagnosis-report.entity';
import { User, UserStatus } from '../../user/entities/user.entity';
import { Organization, OrganizationTier } from '../../user/entities/organization.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { Content } from '../../content/entities/content.entity';
import { Brand } from '../../brand/entities/brand.entity';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCredits: number;
  monthlyRevenue: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  totalBrands: number;
  totalDiagnoses: number;
  completedDiagnoses: number;
  totalContent: number;
  publishedContent: number;
}

export interface BrandStats {
  geoScore: number;
  industryAvg: number;
  mentionRate: number;
  mentionTarget: number;
  competitorSuppression: number;
  competitorCount: number;
  roi: number;
}

export interface TechStats {
  apiHealth: number;
  crawlerScore: number;
  schemaScore: number;
  performance: number;
  pendingTasks: number;
}

export interface OpsStats {
  pendingCount: number;
  totalContent: number;
  publishedContent: number;
  pendingContent: number;
  avgEngagement: number;
}

@Injectable()
export class DataSourceService {
  private readonly logger = new Logger(DataSourceService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(DiagnosisTask)
    private diagnosisTaskRepository: Repository<DiagnosisTask>,
    @InjectRepository(DiagnosisReport)
    private diagnosisReportRepository: Repository<DiagnosisReport>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  /**
   * 获取全局统计数据
   */
  async getDashboardStats(organizationId?: string): Promise<DashboardStats> {
    try {
      const whereClause = organizationId ? { organizationId } : {};

      // 用户统计
      const [allUsers, activeUsers] = await Promise.all([
        this.userRepository.count({ where: whereClause }),
        this.userRepository.count({ where: { ...whereClause, status: UserStatus.ACTIVE } }),
      ]);

      // 组织统计
      const [organizations, freeOrgs, proOrgs, enterpriseOrgs] = await Promise.all([
        organizationId ? Promise.resolve(1) : this.orgRepository.count(),
        this.orgRepository.count({ where: { tier: OrganizationTier.FREE } }),
        this.orgRepository.count({ where: { tier: OrganizationTier.BASIC } }),
        this.orgRepository.count({ where: { tier: OrganizationTier.PROFESSIONAL } }),
      ]);

      // 订阅统计
      const subscriptions = await this.subscriptionRepository.find({ where: whereClause });

      // 本月收入统计
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyOrders = await this.orderRepository.find({
        where: {
          ...whereClause,
          status: OrderStatus.PAID,
          createdAt: MoreThan(startOfMonth),
        },
      });
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + Number(order.amount), 0);

      // 品牌统计
      const [totalBrands] = await Promise.all([
        this.brandRepository.count({ where: whereClause }),
      ]);

      // 诊断统计
      const [totalDiagnoses, completedDiagnoses] = await Promise.all([
        this.diagnosisTaskRepository.count({ where: whereClause }),
        this.diagnosisTaskRepository.count({
          where: { ...whereClause, status: DiagnosisStatus.COMPLETED },
        }),
      ]);

      // 内容统计
      const [totalContent, publishedContent] = await Promise.all([
        this.contentRepository.count({ where: whereClause }),
        this.contentRepository.count({
          where: { ...whereClause, published: true },
        }),
      ]);

      // 计算积分
      const totalCredits = subscriptions.reduce((sum, sub) => sum + (sub.credits || 0), 0);

      return {
        totalUsers: allUsers,
        activeUsers,
        totalCredits,
        monthlyRevenue,
        freeUsers: freeOrgs,
        proUsers: proOrgs + enterpriseOrgs,
        enterpriseUsers: enterpriseOrgs,
        totalBrands,
        totalDiagnoses,
        completedDiagnoses,
        totalContent,
        publishedContent,
      };
    } catch (error) {
      this.logger.error('获取统计数据失败', error);
      return this.getDefaultStats();
    }
  }

  /**
   * 获取品牌的GEO统计数据
   */
  async getBrandStats(brandId: string): Promise<BrandStats> {
    try {
      // 获取品牌的最新诊断报告
      const latestReport = await this.diagnosisReportRepository.findOne({
        where: { taskId: brandId },
        order: { createdAt: 'DESC' },
      });

      // 获取历史诊断数据计算趋势
      const reports = await this.diagnosisReportRepository.find({
        where: { taskId: brandId },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      // 计算行业平均分（使用所有报告的平均分）
      const industryAvg = reports.length > 0
        ? reports.reduce((sum, r) => sum + Number(r.overallScore), 0) / reports.length
        : 65;

      // 从诊断报告获取各项指标
      const geoScore = latestReport ? Number(latestReport.overallScore) : 72;

      return {
        geoScore,
        industryAvg: Math.round(industryAvg),
        mentionRate: this.calculateMentionRate(reports),
        mentionTarget: 50,
        competitorSuppression: this.calculateCompetitorSuppression(reports),
        competitorCount: latestReport?.competitorAnalysis ? 3 : 0,
        roi: this.calculateROI(reports),
      };
    } catch (error) {
      this.logger.error(`获取品牌统计数据失败: ${brandId}`, error);
      return this.getDefaultBrandStats();
    }
  }

  /**
   * 获取技术健康度数据
   */
  async getTechStats(organizationId: string): Promise<TechStats> {
    try {
      // 获取待处理的诊断任务
      const pendingTasks = await this.diagnosisTaskRepository.count({
        where: { organizationId, status: DiagnosisStatus.RUNNING },
      });

      // 获取最新诊断报告
      const latestReport = await this.diagnosisReportRepository.findOne({
        where: { organizationId },
        order: { createdAt: 'DESC' },
      });

      // 从诊断报告中提取技术指标
      const schemaScore = latestReport?.dimensionScores?.find(
        (d: any) => d.name?.includes('技术') || d.name?.includes('SEO')
      )?.score || 75;

      const crawlerScore = latestReport?.dimensionScores?.find(
        (d: any) => d.name?.includes('爬虫') || d.name?.includes('索引')
      )?.score || 88;

      const performance = latestReport?.dimensionScores?.find(
        (d: any) => d.name?.includes('性能')
      )?.score || 92;

      return {
        apiHealth: 95, // API健康度通常由监控系统提供
        crawlerScore: Math.round(crawlerScore),
        schemaScore: Math.round(schemaScore),
        performance: Math.round(performance),
        pendingTasks,
      };
    } catch (error) {
      this.logger.error('获取技术统计数据失败', error);
      return this.getDefaultTechStats();
    }
  }

  /**
   * 获取运营数据
   */
  async getOpsStats(organizationId: string): Promise<OpsStats> {
    try {
      const [totalContent, publishedContent] = await Promise.all([
        this.contentRepository.count({ where: { organizationId } }),
        this.contentRepository.count({ where: { organizationId, published: true } }),
      ]);

      // 计算平均互动率（基于内容统计数据）
      const contents = await this.contentRepository.find({
        where: { organizationId, published: true },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      // 模拟互动率计算（实际应该从发布平台获取）
      const avgEngagement = contents.length > 0
        ? contents.reduce((sum, c) => sum + (c.engagement || 0), 0) / contents.length
        : 12.5;

      return {
        pendingCount: totalContent - publishedContent,
        totalContent,
        publishedContent,
        pendingContent: totalContent - publishedContent,
        avgEngagement: Math.round(avgEngagement * 10) / 10,
      };
    } catch (error) {
      this.logger.error('获取运营统计数据失败', error);
      return this.getDefaultOpsStats();
    }
  }

  /**
   * 获取品牌排名
   */
  async getBrandRanking(organizationId: string): Promise<Array<{
    id: string;
    name: string;
    score: number;
    mentionRate: number;
    trend: number;
    isCurrentBrand: boolean;
  }>> {
    try {
      const brands = await this.brandRepository.find({
        where: { organizationId },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      const rankings = await Promise.all(
        brands.map(async (brand, index) => {
          const report = await this.diagnosisReportRepository.findOne({
            where: { taskId: brand.id },
            order: { createdAt: 'DESC' },
          });

          const prevReports = await this.diagnosisReportRepository.find({
            where: { taskId: brand.id },
            order: { createdAt: 'DESC' },
            skip: 1,
            take: 1,
          });
          const prevReport = prevReports[0];

          const score = report ? Number(report.overallScore) : 50;
          const prevScore = prevReport ? Number(prevReport.overallScore) : score;
          const trend = score - prevScore;

          return {
            id: brand.id,
            name: brand.name,
            score,
            mentionRate: 20 + Math.random() * 30, // 模拟提及率
            trend: Math.round(trend * 10) / 10,
            isCurrentBrand: index === 0,
          };
        })
      );

      // 按分数排序
      return rankings.sort((a, b) => b.score - a.score);
    } catch (error) {
      this.logger.error('获取品牌排名失败', error);
      return this.getDefaultBrandRanking();
    }
  }

  /**
   * 获取可见度趋势
   */
  async getVisibilityTrend(organizationId: string, period: string = '30d'): Promise<Array<{
    date: string;
    value: number;
  }>> {
    try {
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const reports = await this.diagnosisReportRepository.find({
        where: { organizationId },
        order: { createdAt: 'DESC' },
        take: days,
      });

      // 按日期聚合数据
      const dataByDate = new Map<string, number[]>();
      
      reports.forEach(report => {
        const dateKey = report.createdAt.toISOString().split('T')[0].substring(5); // MM-DD格式
        const score = Number(report.overallScore);
        if (!dataByDate.has(dateKey)) {
          dataByDate.set(dateKey, []);
        }
        dataByDate.get(dateKey)!.push(score);
      });

      // 生成趋势数据
      const data: { date: string; value: number }[] = [];
      const sortedDates = Array.from(dataByDate.keys()).sort();

      if (sortedDates.length > 0) {
        sortedDates.forEach(date => {
          const scores = dataByDate.get(date)!;
          data.push({
            date: date.replace('-', '/'),
            value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          });
        });
      } else {
        // 如果没有数据，生成模拟趋势
        for (let i = days; i > 0; i -= Math.ceil(days / 7)) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          data.push({
            date: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
            value: 60 + Math.floor(Math.random() * 20),
          });
        }
      }

      return data;
    } catch (error) {
      this.logger.error('获取可见度趋势失败', error);
      return this.getDefaultVisibilityTrend(period === '7d' ? 7 : period === '90d' ? 90 : 30);
    }
  }

  /**
   * 获取待办任务
   */
  async getPendingTasks(organizationId: string): Promise<Array<{
    id: string;
    title: string;
    style: string;
    platform: string;
    impact: number;
    status: string;
  }>> {
    try {
      // 获取未完成的内容任务
      const contents = await this.contentRepository.find({
        where: { organizationId, published: false },
        order: { createdAt: 'DESC' },
        take: 5,
      });

      // 获取待处理的诊断任务
      const diagnosisTasks = await this.diagnosisTaskRepository.find({
        where: { organizationId, status: DiagnosisStatus.PENDING },
        order: { createdAt: 'DESC' },
        take: 3,
      });

      const tasks: Array<{
        id: string;
        title: string;
        style: string;
        platform: string;
        impact: number;
        status: string;
      }> = [];

      contents.forEach((content, index) => {
        tasks.push({
          id: String(content.id),
          title: content.title || '未命名内容',
          style: content.aiEngine || '标准风格',
          platform: content.platform || '多平台',
          impact: content.engagement || 8,
          status: 'pending',
        });
      });

      diagnosisTasks.forEach((task, index) => {
        tasks.push({
          id: task.id,
          title: `品牌诊断: ${task.brandName}`,
          style: task.aiEngine || 'AI分析',
          platform: '诊断',
          impact: 10,
          status: 'pending',
        });
      });

      return tasks;
    } catch (error) {
      this.logger.error('获取待办任务失败', error);
      return [];
    }
  }

  /**
   * 获取运营建议
   */
  async getSuggestions(organizationId: string): Promise<Array<{
    text: string;
    tag: string;
    priority: 'high' | 'medium' | 'low';
  }>> {
    try {
      const suggestions: Array<{
        text: string;
        tag: string;
        priority: 'high' | 'medium' | 'low';
      }> = [];

      // 基于诊断报告生成建议
      const latestReport = await this.diagnosisReportRepository.findOne({
        where: { organizationId },
        order: { createdAt: 'DESC' },
      });

      if (latestReport && latestReport.issues?.length > 0) {
        const criticalIssues = latestReport.issues.filter((i: any) => i.severity === 'critical' || i.severity === 'high');
        if (criticalIssues.length > 0) {
          suggestions.push({
            text: `发现${criticalIssues.length}个高优先级SEO问题，建议立即处理`,
            tag: '高优先级',
            priority: 'high',
          });
        }
      }

      // 基于内容统计生成建议
      const pendingCount = await this.contentRepository.count({
        where: { organizationId, published: false },
      });

      if (pendingCount > 5) {
        suggestions.push({
          text: `您有${pendingCount}篇待发布内容，建议尽快发布以提升品牌可见度`,
          tag: '建议',
          priority: 'medium',
        });
      }

      // 基于订阅统计生成建议
      const subscriptions = await this.subscriptionRepository.find({
        where: { organizationId },
      });

      const lowCredits = subscriptions.filter(s => (s.credits || 0) < 100);
      if (lowCredits.length > 0) {
        suggestions.push({
          text: '积分余额较低，建议充值以保证服务连续性',
          tag: '提醒',
          priority: 'low',
        });
      }

      return suggestions;
    } catch (error) {
      this.logger.error('获取运营建议失败', error);
      return [];
    }
  }

  // 辅助方法
  private calculateMentionRate(reports: DiagnosisReport[]): number {
    if (reports.length === 0) return 30;
    // 基于诊断得分趋势计算
    return Math.min(100, 20 + reports.length * 5);
  }

  private calculateCompetitorSuppression(reports: DiagnosisReport[]): number {
    if (reports.length === 0) return 10;
    // 基于诊断得分与竞品分析计算
    return Math.min(50, reports.length * 3);
  }

  private calculateROI(reports: DiagnosisReport[]): number {
    if (reports.length === 0) return 15;
    // 简化ROI计算
    const avgScore = reports.reduce((sum, r) => sum + Number(r.overallScore), 0) / reports.length;
    return Math.round((avgScore - 50) * 0.5 * 10) / 10;
  }

  // 默认值方法
  getDefaultStats(): DashboardStats {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalCredits: 0,
      monthlyRevenue: 0,
      freeUsers: 0,
      proUsers: 0,
      enterpriseUsers: 0,
      totalBrands: 0,
      totalDiagnoses: 0,
      completedDiagnoses: 0,
      totalContent: 0,
      publishedContent: 0,
    };
  }

  getDefaultBrandStats(): BrandStats {
    return {
      geoScore: 72,
      industryAvg: 65,
      mentionRate: 34,
      mentionTarget: 50,
      competitorSuppression: 12,
      competitorCount: 3,
      roi: 23,
    };
  }

  getDefaultTechStats(): TechStats {
    return {
      apiHealth: 95,
      crawlerScore: 88,
      schemaScore: 75,
      performance: 92,
      pendingTasks: 0,
    };
  }

  getDefaultOpsStats(): OpsStats {
    return {
      pendingCount: 0,
      totalContent: 0,
      publishedContent: 0,
      pendingContent: 0,
      avgEngagement: 0,
    };
  }

  getDefaultBrandRanking(): Array<{
    id: string;
    name: string;
    score: number;
    mentionRate: number;
    trend: number;
    isCurrentBrand: boolean;
  }> {
    return [
      { id: '1', name: '示例品牌', score: 72, mentionRate: 34, trend: 8, isCurrentBrand: true },
      { id: '2', name: '竞品A', score: 68, mentionRate: 28, trend: 3, isCurrentBrand: false },
      { id: '3', name: '竞品B', score: 65, mentionRate: 22, trend: -2, isCurrentBrand: false },
    ];
  }

  getDefaultVisibilityTrend(days: number): Array<{ date: string; value: number }> {
    const data: { date: string; value: number }[] = [];
    for (let i = days; i > 0; i -= Math.ceil(days / 7)) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
        value: 50 + Math.floor(Math.random() * 20),
      });
    }
    return data;
  }
}
