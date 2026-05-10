"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DataSourceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const diagnosis_task_entity_1 = require("../../diagnosis/entities/diagnosis-task.entity");
const diagnosis_report_entity_1 = require("../../diagnosis/entities/diagnosis-report.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const organization_entity_1 = require("../../user/entities/organization.entity");
const subscription_entity_1 = require("../../subscription/entities/subscription.entity");
const order_entity_1 = require("../../order/entities/order.entity");
const content_entity_1 = require("../../content/entities/content.entity");
const brand_entity_1 = require("../../brand/entities/brand.entity");
let DataSourceService = DataSourceService_1 = class DataSourceService {
    constructor(userRepository, orgRepository, subscriptionRepository, orderRepository, contentRepository, diagnosisTaskRepository, diagnosisReportRepository, brandRepository) {
        this.userRepository = userRepository;
        this.orgRepository = orgRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.orderRepository = orderRepository;
        this.contentRepository = contentRepository;
        this.diagnosisTaskRepository = diagnosisTaskRepository;
        this.diagnosisReportRepository = diagnosisReportRepository;
        this.brandRepository = brandRepository;
        this.logger = new common_1.Logger(DataSourceService_1.name);
    }
    async getDashboardStats(organizationId) {
        try {
            const whereClause = organizationId ? { organizationId } : {};
            const [allUsers, activeUsers] = await Promise.all([
                this.userRepository.count({ where: whereClause }),
                this.userRepository.count({ where: { ...whereClause, status: user_entity_1.UserStatus.ACTIVE } }),
            ]);
            const [organizations, freeOrgs, proOrgs, enterpriseOrgs] = await Promise.all([
                organizationId ? Promise.resolve(1) : this.orgRepository.count(),
                this.orgRepository.count({ where: { tier: organization_entity_1.OrganizationTier.FREE } }),
                this.orgRepository.count({ where: { tier: organization_entity_1.OrganizationTier.BASIC } }),
                this.orgRepository.count({ where: { tier: organization_entity_1.OrganizationTier.PROFESSIONAL } }),
            ]);
            const subscriptions = await this.subscriptionRepository.find({ where: whereClause });
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const monthlyOrders = await this.orderRepository.find({
                where: {
                    ...whereClause,
                    status: order_entity_1.OrderStatus.PAID,
                    createdAt: (0, typeorm_2.MoreThan)(startOfMonth),
                },
            });
            const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + Number(order.amount), 0);
            const [totalBrands] = await Promise.all([
                this.brandRepository.count({ where: whereClause }),
            ]);
            const [totalDiagnoses, completedDiagnoses] = await Promise.all([
                this.diagnosisTaskRepository.count({ where: whereClause }),
                this.diagnosisTaskRepository.count({
                    where: { ...whereClause, status: diagnosis_task_entity_1.DiagnosisStatus.COMPLETED },
                }),
            ]);
            const [totalContent, publishedContent] = await Promise.all([
                this.contentRepository.count({ where: whereClause }),
                this.contentRepository.count({
                    where: { ...whereClause, published: true },
                }),
            ]);
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
        }
        catch (error) {
            this.logger.error('获取统计数据失败', error);
            return this.getDefaultStats();
        }
    }
    async getBrandStats(brandId) {
        try {
            const latestReport = await this.diagnosisReportRepository.findOne({
                where: { taskId: brandId },
                order: { createdAt: 'DESC' },
            });
            const reports = await this.diagnosisReportRepository.find({
                where: { taskId: brandId },
                order: { createdAt: 'DESC' },
                take: 10,
            });
            const industryAvg = reports.length > 0
                ? reports.reduce((sum, r) => sum + Number(r.overallScore), 0) / reports.length
                : 65;
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
        }
        catch (error) {
            this.logger.error(`获取品牌统计数据失败: ${brandId}`, error);
            return this.getDefaultBrandStats();
        }
    }
    async getTechStats(organizationId) {
        try {
            const pendingTasks = await this.diagnosisTaskRepository.count({
                where: { organizationId, status: diagnosis_task_entity_1.DiagnosisStatus.RUNNING },
            });
            const latestReport = await this.diagnosisReportRepository.findOne({
                where: { organizationId },
                order: { createdAt: 'DESC' },
            });
            const schemaScore = latestReport?.dimensionScores?.find((d) => d.name?.includes('技术') || d.name?.includes('SEO'))?.score || 75;
            const crawlerScore = latestReport?.dimensionScores?.find((d) => d.name?.includes('爬虫') || d.name?.includes('索引'))?.score || 88;
            const performance = latestReport?.dimensionScores?.find((d) => d.name?.includes('性能'))?.score || 92;
            return {
                apiHealth: 95,
                crawlerScore: Math.round(crawlerScore),
                schemaScore: Math.round(schemaScore),
                performance: Math.round(performance),
                pendingTasks,
            };
        }
        catch (error) {
            this.logger.error('获取技术统计数据失败', error);
            return this.getDefaultTechStats();
        }
    }
    async getOpsStats(organizationId) {
        try {
            const [totalContent, publishedContent] = await Promise.all([
                this.contentRepository.count({ where: { organizationId } }),
                this.contentRepository.count({ where: { organizationId, published: true } }),
            ]);
            const contents = await this.contentRepository.find({
                where: { organizationId, published: true },
                order: { createdAt: 'DESC' },
                take: 10,
            });
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
        }
        catch (error) {
            this.logger.error('获取运营统计数据失败', error);
            return this.getDefaultOpsStats();
        }
    }
    async getBrandRanking(organizationId) {
        try {
            const brands = await this.brandRepository.find({
                where: { organizationId },
                order: { createdAt: 'DESC' },
                take: 10,
            });
            const rankings = await Promise.all(brands.map(async (brand, index) => {
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
                    mentionRate: 20 + Math.random() * 30,
                    trend: Math.round(trend * 10) / 10,
                    isCurrentBrand: index === 0,
                };
            }));
            return rankings.sort((a, b) => b.score - a.score);
        }
        catch (error) {
            this.logger.error('获取品牌排名失败', error);
            return this.getDefaultBrandRanking();
        }
    }
    async getVisibilityTrend(organizationId, period = '30d') {
        try {
            const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
            const reports = await this.diagnosisReportRepository.find({
                where: { organizationId },
                order: { createdAt: 'DESC' },
                take: days,
            });
            const dataByDate = new Map();
            reports.forEach(report => {
                const dateKey = report.createdAt.toISOString().split('T')[0].substring(5);
                const score = Number(report.overallScore);
                if (!dataByDate.has(dateKey)) {
                    dataByDate.set(dateKey, []);
                }
                dataByDate.get(dateKey).push(score);
            });
            const data = [];
            const sortedDates = Array.from(dataByDate.keys()).sort();
            if (sortedDates.length > 0) {
                sortedDates.forEach(date => {
                    const scores = dataByDate.get(date);
                    data.push({
                        date: date.replace('-', '/'),
                        value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
                    });
                });
            }
            else {
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
        }
        catch (error) {
            this.logger.error('获取可见度趋势失败', error);
            return this.getDefaultVisibilityTrend(period === '7d' ? 7 : period === '90d' ? 90 : 30);
        }
    }
    async getPendingTasks(organizationId) {
        try {
            const contents = await this.contentRepository.find({
                where: { organizationId, published: false },
                order: { createdAt: 'DESC' },
                take: 5,
            });
            const diagnosisTasks = await this.diagnosisTaskRepository.find({
                where: { organizationId, status: diagnosis_task_entity_1.DiagnosisStatus.PENDING },
                order: { createdAt: 'DESC' },
                take: 3,
            });
            const tasks = [];
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
        }
        catch (error) {
            this.logger.error('获取待办任务失败', error);
            return [];
        }
    }
    async getSuggestions(organizationId) {
        try {
            const suggestions = [];
            const latestReport = await this.diagnosisReportRepository.findOne({
                where: { organizationId },
                order: { createdAt: 'DESC' },
            });
            if (latestReport && latestReport.issues?.length > 0) {
                const criticalIssues = latestReport.issues.filter((i) => i.severity === 'critical' || i.severity === 'high');
                if (criticalIssues.length > 0) {
                    suggestions.push({
                        text: `发现${criticalIssues.length}个高优先级SEO问题，建议立即处理`,
                        tag: '高优先级',
                        priority: 'high',
                    });
                }
            }
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
        }
        catch (error) {
            this.logger.error('获取运营建议失败', error);
            return [];
        }
    }
    calculateMentionRate(reports) {
        if (reports.length === 0)
            return 30;
        return Math.min(100, 20 + reports.length * 5);
    }
    calculateCompetitorSuppression(reports) {
        if (reports.length === 0)
            return 10;
        return Math.min(50, reports.length * 3);
    }
    calculateROI(reports) {
        if (reports.length === 0)
            return 15;
        const avgScore = reports.reduce((sum, r) => sum + Number(r.overallScore), 0) / reports.length;
        return Math.round((avgScore - 50) * 0.5 * 10) / 10;
    }
    getDefaultStats() {
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
    getDefaultBrandStats() {
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
    getDefaultTechStats() {
        return {
            apiHealth: 95,
            crawlerScore: 88,
            schemaScore: 75,
            performance: 92,
            pendingTasks: 0,
        };
    }
    getDefaultOpsStats() {
        return {
            pendingCount: 0,
            totalContent: 0,
            publishedContent: 0,
            pendingContent: 0,
            avgEngagement: 0,
        };
    }
    getDefaultBrandRanking() {
        return [
            { id: '1', name: '示例品牌', score: 72, mentionRate: 34, trend: 8, isCurrentBrand: true },
            { id: '2', name: '竞品A', score: 68, mentionRate: 28, trend: 3, isCurrentBrand: false },
            { id: '3', name: '竞品B', score: 65, mentionRate: 22, trend: -2, isCurrentBrand: false },
        ];
    }
    getDefaultVisibilityTrend(days) {
        const data = [];
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
};
exports.DataSourceService = DataSourceService;
exports.DataSourceService = DataSourceService = DataSourceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __param(5, (0, typeorm_1.InjectRepository)(diagnosis_task_entity_1.DiagnosisTask)),
    __param(6, (0, typeorm_1.InjectRepository)(diagnosis_report_entity_1.DiagnosisReport)),
    __param(7, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DataSourceService);
//# sourceMappingURL=data-source.service.js.map