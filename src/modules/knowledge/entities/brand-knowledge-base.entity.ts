import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from '../../user/entities/organization.entity';

/**
 * 品牌知识库实体
 * 与 organizations 表一对一关联
 */
@Entity('brand_knowledge_base')
export class BrandKnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  organizationId: string;

  @OneToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // 模块一：企业基础信息
  @Column({ type: 'json', nullable: true })
  basicInfo: {
    companyName?: string;
    companyShortName?: string;
    industry?: string;
    industrySegment?: string;
    companyRegion?: string;
    mainBizArea?: string;
    bizModel?: string[];
    companyScale?: string;
    website?: string;
    socialMedia?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  };

  // 模块二：核心业务与定位
  @Column({ type: 'json', nullable: true })
  bizPositioning: {
    coreBizIntro?: string;
    targetCustomer?: string;
    customerPainPoint?: string;
    differentialAdvantage?: string;
    forbiddenBiz?: string;
  };

  // 模块三：产品与服务详情
  @Column({ type: 'json', nullable: true })
  productService: {
    productServiceList?: { productName: string; productDesc: string }[];
    productSellPoint?: string;
    serviceDetails?: string;
    coreKeywords?: string[];
    successCases?: {
      caseName: string;
      caseDesc: string;
      caseFile?: string;
    }[];
  };

  // 模块四：竞品与市场信息
  @Column({ type: 'json', nullable: true })
  competitorMarket: {
    competitors?: { competitorName: string; competitorWebsite: string }[];
    competitorAdvDisadv?: string;
    marketGap?: string;
  };

  // 模块五：GEO推广目标
  @Column({ type: 'json', nullable: true })
  geoGoals: {
    promotionGoals?: string[];
    keyPromotionArea?: string;
    forbiddenPromotionArea?: string;
    keywordDirection?: string[];
    budgetAndRhythm?: string;
    expectedEffect?: string;
    promotionCycle?: { start: string; end: string };
  };

  // 模块六：资料上传区索引（文件存储在COS）
  @Column({ type: 'json', nullable: true })
  fileIndex: {
    [key: string]: { fileId: string; name: string; url: string; uploadedAt: string }[] | string | undefined;
    certFiles?: { fileId: string; name: string; url: string; uploadedAt: string }[];
    productFiles?: { fileId: string; name: string; url: string; uploadedAt: string }[];
    serviceFiles?: { fileId: string; name: string; url: string; uploadedAt: string }[];
    caseFiles?: { fileId: string; name: string; url: string; uploadedAt: string }[];
    marketingFiles?: { fileId: string; name: string; url: string; uploadedAt: string }[];
    fileRemark?: string;
  };

  // 模块七：补充信息
  @Column({ type: 'json', nullable: true })
  supplement: {
    brandForbiddenWords?: string;
    complianceRequirements?: string;
    previousPromotion?: string;
    specialRequirements?: string;
    versionRemark?: string;
    lastDiagnosisInsights?: string[];
    // 诊断结果字段
    lastDiagnosisScore?: number;
    lastDiagnosisGrade?: string;
    lastDiagnosisReportId?: string;
  };

  // 上次诊断得分
  @Column({ type: 'float', nullable: true })
  lastDiagnosisScore: number;

  // 上次诊断等级
  @Column({ type: 'varchar', length: 10, nullable: true })
  lastDiagnosisGrade: string;

  // 上次诊断报告ID
  @Column({ type: 'varchar', length: 100, nullable: true })
  lastDiagnosisReportId: string;

  // 知识库版本号
  @Column({ type: 'int', default: 1 })
  version: number;

  // 上次增量诊断时间
  @Column({ type: 'datetime', nullable: true })
  lastDiagnosisRefresh: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
