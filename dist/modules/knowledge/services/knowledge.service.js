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
var KnowledgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_knowledge_base_entity_1 = require("../entities/brand-knowledge-base.entity");
let KnowledgeService = KnowledgeService_1 = class KnowledgeService {
    constructor(knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
        this.logger = new common_1.Logger(KnowledgeService_1.name);
    }
    async getKnowledgeBase(organizationId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return null;
        }
        return this.mapToDto(knowledge);
    }
    async createKnowledgeBase(organizationId, dto) {
        const existing = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (existing) {
            return this.updateKnowledgeBase(organizationId, dto);
        }
        const knowledge = this.knowledgeRepository.create({
            organizationId,
            basicInfo: dto.basicInfo || {},
            bizPositioning: dto.bizPositioning || {},
            productService: dto.productService || {},
            geoGoals: dto.geoGoals || {},
            version: 1,
        });
        const saved = await this.knowledgeRepository.save(knowledge);
        return this.mapToDto(saved);
    }
    async updateKnowledgeBase(organizationId, dto) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return this.createKnowledgeBase(organizationId, dto);
        }
        const changedFields = [];
        if (dto.basicInfo !== undefined) {
            knowledge.basicInfo = { ...knowledge.basicInfo, ...dto.basicInfo };
            changedFields.push('basicInfo');
        }
        if (dto.bizPositioning !== undefined) {
            knowledge.bizPositioning = { ...knowledge.bizPositioning, ...dto.bizPositioning };
            changedFields.push('bizPositioning');
        }
        if (dto.productService !== undefined) {
            knowledge.productService = { ...knowledge.productService, ...dto.productService };
            changedFields.push('productService');
        }
        if (dto.competitorMarket !== undefined) {
            knowledge.competitorMarket = { ...knowledge.competitorMarket, ...dto.competitorMarket };
            changedFields.push('competitorMarket');
        }
        if (dto.geoGoals !== undefined) {
            knowledge.geoGoals = { ...knowledge.geoGoals, ...dto.geoGoals };
            changedFields.push('geoGoals');
        }
        if (dto.supplement !== undefined) {
            knowledge.supplement = { ...knowledge.supplement, ...dto.supplement };
            changedFields.push('supplement');
        }
        knowledge.version += 1;
        const saved = await this.knowledgeRepository.save(knowledge);
        this.logger.log(`Knowledge base updated for org ${organizationId}, version: ${knowledge.version}, changed fields: ${changedFields.join(', ')}`);
        return this.mapToDto(saved);
    }
    async uploadFile(organizationId, module, file) {
        let knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            const created = await this.createKnowledgeBase(organizationId, {});
            knowledge = await this.knowledgeRepository.findOne({
                where: { organizationId },
            });
            if (!knowledge) {
                throw new Error('知识库创建失败');
            }
        }
        const fileInfo = {
            fileId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.originalname,
            url: `/uploads/knowledge/${organizationId}/${module}/${file.originalname}`,
            uploadedAt: new Date().toISOString(),
        };
        const fileIndex = knowledge.fileIndex || {};
        if (!fileIndex[module]) {
            fileIndex[module] = [];
        }
        fileIndex[module].push(fileInfo);
        knowledge.fileIndex = fileIndex;
        knowledge.version += 1;
        await this.knowledgeRepository.save(knowledge);
        return {
            fileId: fileInfo.fileId,
            url: fileInfo.url,
            status: 'uploaded',
            fileName: file.originalname,
            fileSize: file.size,
        };
    }
    async deleteFile(organizationId, fileId) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge || !knowledge.fileIndex) {
            return false;
        }
        let found = false;
        const fileIndex = { ...knowledge.fileIndex };
        for (const module of Object.keys(fileIndex)) {
            const files = fileIndex[module] || [];
            if (!Array.isArray(files))
                continue;
            const index = files.findIndex((f) => f.fileId === fileId);
            if (index !== -1) {
                files.splice(index, 1);
                fileIndex[module] = files;
                found = true;
                break;
            }
        }
        if (found) {
            knowledge.fileIndex = fileIndex;
            knowledge.version += 1;
            await this.knowledgeRepository.save(knowledge);
            return true;
        }
        return false;
    }
    async getVersionHistory(organizationId, page = 1, size = 10) {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { organizationId },
        });
        if (!knowledge) {
            return { list: [], total: 0 };
        }
        return {
            list: [
                {
                    version: knowledge.version,
                    updatedAt: knowledge.updatedAt,
                    changedFields: [],
                    versionRemark: knowledge.supplement?.versionRemark,
                },
            ],
            total: 1,
        };
    }
    async getAiSuggestion(field, source) {
        const suggestions = {
            companyName: '建议填写公司全称，便于AI精准匹配',
            industry: '建议填写所属行业，如：科技、教育、医疗等',
            coreBizIntro: '建议用一句话概括核心业务，突出差异化价值',
            targetCustomer: '越具体越好，如：ToB-中大型企业-IT部门',
        };
        return {
            suggestion: suggestions[field] || '请填写相关信息，AI将基于此生成更精准的诊断和策略',
            confidence: 0.85,
            matchedFields: [field],
        };
    }
    mapToDto(entity) {
        return {
            id: entity.id,
            organizationId: entity.organizationId,
            version: entity.version,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            basicInfo: entity.basicInfo,
            bizPositioning: entity.bizPositioning,
            productService: entity.productService,
            competitorMarket: entity.competitorMarket,
            geoGoals: entity.geoGoals,
            fileIndex: entity.fileIndex,
            supplement: entity.supplement,
            lastDiagnosisRefresh: entity.lastDiagnosisRefresh,
        };
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = KnowledgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_knowledge_base_entity_1.BrandKnowledgeBase)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map