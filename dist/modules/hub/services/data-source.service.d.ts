import { Repository } from 'typeorm';
import { DiagnosisTask } from '../../diagnosis/entities/diagnosis-task.entity';
import { DiagnosisReport } from '../../diagnosis/entities/diagnosis-report.entity';
import { User } from '../../user/entities/user.entity';
import { Organization } from '../../user/entities/organization.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { Order } from '../../order/entities/order.entity';
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
export declare class DataSourceService {
    private userRepository;
    private orgRepository;
    private subscriptionRepository;
    private orderRepository;
    private contentRepository;
    private diagnosisTaskRepository;
    private diagnosisReportRepository;
    private brandRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, orgRepository: Repository<Organization>, subscriptionRepository: Repository<Subscription>, orderRepository: Repository<Order>, contentRepository: Repository<Content>, diagnosisTaskRepository: Repository<DiagnosisTask>, diagnosisReportRepository: Repository<DiagnosisReport>, brandRepository: Repository<Brand>);
    getDashboardStats(organizationId?: string): Promise<DashboardStats>;
    getBrandStats(brandId: string): Promise<BrandStats>;
    getTechStats(organizationId: string): Promise<TechStats>;
    getOpsStats(organizationId: string): Promise<OpsStats>;
    getBrandRanking(organizationId: string): Promise<Array<{
        id: string;
        name: string;
        score: number;
        mentionRate: number;
        trend: number;
        isCurrentBrand: boolean;
    }>>;
    getVisibilityTrend(organizationId: string, period?: string): Promise<Array<{
        date: string;
        value: number;
    }>>;
    getPendingTasks(organizationId: string): Promise<Array<{
        id: string;
        title: string;
        style: string;
        platform: string;
        impact: number;
        status: string;
    }>>;
    getSuggestions(organizationId: string): Promise<Array<{
        text: string;
        tag: string;
        priority: 'high' | 'medium' | 'low';
    }>>;
    private calculateMentionRate;
    private calculateCompetitorSuppression;
    private calculateROI;
    getDefaultStats(): DashboardStats;
    getDefaultBrandStats(): BrandStats;
    getDefaultTechStats(): TechStats;
    getDefaultOpsStats(): OpsStats;
    getDefaultBrandRanking(): Array<{
        id: string;
        name: string;
        score: number;
        mentionRate: number;
        trend: number;
        isCurrentBrand: boolean;
    }>;
    getDefaultVisibilityTrend(days: number): Array<{
        date: string;
        value: number;
    }>;
}
