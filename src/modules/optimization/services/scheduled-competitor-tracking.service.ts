import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CompetitorRepository } from '../repositories/competitor.repository';
import { CompetitorAutoTrackService } from './competitor-auto-track.service';

/**
 * 定时竞品追踪服务
 * 基于 Scheduler 实现自动化竞品监控
 */
@Injectable()
export class ScheduledCompetitorTrackingService {
  private readonly logger = new Logger(ScheduledCompetitorTrackingService.name);

  constructor(
    private readonly competitorRepository: CompetitorRepository,
    private readonly competitorAutoTrackService: CompetitorAutoTrackService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * 每日凌晨2点执行竞品追踪检查
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'daily_competitor_tracking' })
  async handleDailyCompetitorTracking() {
    this.logger.log('开始执行每日竞品追踪检查...');
    
    try {
      // 获取所有启用的竞品追踪
      const trackedCompetitors = await this.competitorRepository.findTrackedCompetitors();
      
      for (const competitor of trackedCompetitors) {
        const trackingStatus = await this.getTrackingStatus(competitor.brandName);
        
        if (trackingStatus.shouldTrack) {
          await this.performTracking(competitor);
        }
      }
      
      this.logger.log(`竞品追踪检查完成，共检查 ${trackedCompetitors.length} 个品牌`);
    } catch (error) {
      this.logger.error('竞品追踪检查失败', error);
    }
  }

  /**
   * 每6小时执行一次排名监控
   */
  @Cron(CronExpression.EVERY_6_HOURS, { name: 'ranking_monitor' })
  async handleRankingMonitor() {
    this.logger.log('开始执行排名监控...');
    
    try {
      const trackedBrands = await this.competitorRepository.findTrackedBrands();
      
      for (const brand of trackedBrands) {
        const status = await this.getTrackingStatus(brand);
        
        if (status.isEnabled && status.schedule === 'high') {
          await this.performRankingCheck(brand);
        }
      }
    } catch (error) {
      this.logger.error('排名监控失败', error);
    }
  }

  /**
   * 每周一早上9点生成竞品周报
   */
  @Cron('0 9 * * 1', { name: 'weekly_competitor_report' })
  async handleWeeklyReport() {
    this.logger.log('开始生成竞品周报...');
    
    try {
      const trackedBrands = await this.competitorRepository.findTrackedBrands();
      
      for (const brand of trackedBrands) {
        const reports = await this.generateWeeklyReport(brand);
        
        if (reports) {
          await this.sendReportNotification(brand, reports);
        }
      }
    } catch (error) {
      this.logger.error('竞品周报生成失败', error);
    }
  }

  /**
   * 获取追踪状态
   */
  async getTrackingStatus(brandName: string) {
    const competitors = await this.competitorRepository.findByBrandName(brandName);
    
    if (!competitors || competitors.length === 0) {
      return {
        isEnabled: false,
        shouldTrack: false,
        schedule: 'normal',
        lastTrackTime: null,
        nextTrackTime: null,
        notifyChannels: [],
      };
    }

    const enabledCompetitors = competitors.filter(c => c.isTracked);
    const lastTrack = competitors
      .map(c => c.lastTrackedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    // 根据频率配置计算下次追踪时间
    const schedule = competitors[0]?.trackingFrequency || 'normal';
    const nextTrackTime = this.calculateNextTrackTime(lastTrack, schedule);

    return {
      isEnabled: enabledCompetitors.length > 0,
      shouldTrack: enabledCompetitors.length > 0 && this.shouldPerformTracking(lastTrack, schedule),
      schedule,
      lastTrackTime: lastTrack,
      nextTrackTime,
      notifyChannels: competitors[0]?.notifyChannels || [],
    };
  }

  /**
   * 配置追踪频率
   */
  async configureSchedule(brandName: string, schedule: string) {
    const competitors = await this.competitorRepository.findByBrandName(brandName);
    
    for (const competitor of competitors) {
      competitor.trackingFrequency = schedule as any;
      await this.competitorRepository.save(competitor);
    }
    
    this.logger.log(`品牌 ${brandName} 的追踪频率已更新为 ${schedule}`);
  }

  /**
   * 配置通知渠道
   */
  async configureNotification(brandName: string, channels: string[]) {
    const competitors = await this.competitorRepository.findByBrandName(brandName);
    
    for (const competitor of competitors) {
      competitor.notifyChannels = channels;
      await this.competitorRepository.save(competitor);
    }
  }

  /**
   * 执行单次追踪
   */
  private async performTracking(competitor: any) {
    try {
      await this.competitorAutoTrackService.trackCompetitor(
        competitor.competitorName,
        competitor.brandName,
      );
      
      competitor.lastTrackedAt = new Date();
      competitor.trackingCount += 1;
      await this.competitorRepository.save(competitor);
      
      this.logger.log(`竞品 ${competitor.competitorName} 追踪完成`);
    } catch (error) {
      this.logger.error(`竞品 ${competitor.competitorName} 追踪失败`, error);
    }
  }

  /**
   * 执行排名检查
   */
  private async performRankingCheck(brand: string) {
    try {
      const report = await this.competitorAutoTrackService.getComparisonReport(brand, []);
      this.logger.log(`品牌 ${brand} 排名检查完成`);
    } catch (error) {
      this.logger.error(`品牌 ${brand} 排名检查失败`, error);
    }
  }

  /**
   * 生成周报
   */
  private async generateWeeklyReport(brand: string) {
    try {
      const history = await this.competitorAutoTrackService.getTrackingHistory(brand);
      // 生成周报逻辑
      return {
        brand,
        generatedAt: new Date(),
        summary: history,
      };
    } catch (error) {
      this.logger.error(`品牌 ${brand} 周报生成失败`, error);
      return null;
    }
  }

  /**
   * 发送报告通知
   */
  private async sendReportNotification(brand: string, report: any) {
    this.logger.log(`竞品周报已生成: ${brand}`);
  }

  /**
   * 计算下次追踪时间
   */
  private calculateNextTrackTime(lastTrack: Date | null, schedule: string): Date | null {
    const now = new Date();
    
    if (!lastTrack) {
      return now;
    }

    const intervals: Record<string, number> = {
      'high': 6 * 60 * 60 * 1000,      // 6小时
      'normal': 24 * 60 * 60 * 1000,   // 1天
      'low': 7 * 24 * 60 * 60 * 1000,  // 7天
    };

    const interval = intervals[schedule] || intervals['normal'];
    return new Date(lastTrack.getTime() + interval);
  }

  /**
   * 判断是否应该执行追踪
   */
  private shouldPerformTracking(lastTrack: Date | null, schedule: string): boolean {
    if (!lastTrack) return true;
    
    const nextTrackTime = this.calculateNextTrackTime(lastTrack, schedule);
    if (!nextTrackTime) return true;
    return new Date() >= nextTrackTime;
  }
}
