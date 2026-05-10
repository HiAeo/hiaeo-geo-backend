import { Organization } from '../../user/entities/organization.entity';
export declare class BrandKnowledgeBase {
    id: string;
    organizationId: string;
    organization: Organization;
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
    bizPositioning: {
        coreBizIntro?: string;
        targetCustomer?: string;
        customerPainPoint?: string;
        differentialAdvantage?: string;
        forbiddenBiz?: string;
    };
    productService: {
        productServiceList?: {
            productName: string;
            productDesc: string;
        }[];
        productSellPoint?: string;
        serviceDetails?: string;
        coreKeywords?: string[];
        successCases?: {
            caseName: string;
            caseDesc: string;
            caseFile?: string;
        }[];
    };
    competitorMarket: {
        competitors?: {
            competitorName: string;
            competitorWebsite: string;
        }[];
        competitorAdvDisadv?: string;
        marketGap?: string;
    };
    geoGoals: {
        promotionGoals?: string[];
        keyPromotionArea?: string;
        forbiddenPromotionArea?: string;
        keywordDirection?: string[];
        budgetAndRhythm?: string;
        expectedEffect?: string;
        promotionCycle?: {
            start: string;
            end: string;
        };
    };
    fileIndex: {
        [key: string]: {
            fileId: string;
            name: string;
            url: string;
            uploadedAt: string;
        }[] | string | undefined;
        certFiles?: {
            fileId: string;
            name: string;
            url: string;
            uploadedAt: string;
        }[];
        productFiles?: {
            fileId: string;
            name: string;
            url: string;
            uploadedAt: string;
        }[];
        serviceFiles?: {
            fileId: string;
            name: string;
            url: string;
            uploadedAt: string;
        }[];
        caseFiles?: {
            fileId: string;
            name: string;
            url: string;
            uploadedAt: string;
        }[];
        marketingFiles?: {
            fileId: string;
            name: string;
            url: string;
            uploadedAt: string;
        }[];
        fileRemark?: string;
    };
    supplement: {
        brandForbiddenWords?: string;
        complianceRequirements?: string;
        previousPromotion?: string;
        specialRequirements?: string;
        versionRemark?: string;
        lastDiagnosisInsights?: string[];
        lastDiagnosisScore?: number;
        lastDiagnosisGrade?: string;
        lastDiagnosisReportId?: string;
    };
    lastDiagnosisScore: number;
    lastDiagnosisGrade: string;
    lastDiagnosisReportId: string;
    version: number;
    lastDiagnosisRefresh: Date;
    createdAt: Date;
    updatedAt: Date;
}
