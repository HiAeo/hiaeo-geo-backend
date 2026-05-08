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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("../entities/organization.entity");
const user_entity_1 = require("../entities/user.entity");
const TierLimits = {
    [organization_entity_1.OrganizationTier.FREE]: { maxUsers: 3, maxBrands: 1 },
    [organization_entity_1.OrganizationTier.BASIC]: { maxUsers: 10, maxBrands: 5 },
    [organization_entity_1.OrganizationTier.PROFESSIONAL]: { maxUsers: 50, maxBrands: 20 },
    [organization_entity_1.OrganizationTier.ENTERPRISE]: { maxUsers: -1, maxBrands: -1 },
};
let OrganizationService = class OrganizationService {
    constructor(organizationRepository, userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }
    async create(dto) {
        const organization = this.organizationRepository.create({
            ...dto,
            tier: organization_entity_1.OrganizationTier.FREE,
            settings: {
                allowedEngines: ['deepseek', 'kimi'],
            },
        });
        const savedOrg = await this.organizationRepository.save(organization);
        savedOrg.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.organizationRepository.save(savedOrg);
        return savedOrg;
    }
    async update(organizationId, dto) {
        const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
        if (!org) {
            throw new common_1.NotFoundException('组织不存在');
        }
        if (dto.tier && dto.tier !== org.tier) {
            const limits = TierLimits[dto.tier];
            org.maxUsers = limits.maxUsers;
            org.maxBrands = limits.maxBrands;
        }
        Object.assign(org, dto);
        return this.organizationRepository.save(org);
    }
    async findOne(organizationId) {
        const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
        if (!org) {
            throw new common_1.NotFoundException('组织不存在');
        }
        return org;
    }
    async findAll() {
        return this.organizationRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async remove(organizationId) {
        const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
        if (!org) {
            throw new common_1.NotFoundException('组织不存在');
        }
        org.isActive = false;
        await this.organizationRepository.save(org);
    }
    async updateUserCount(organizationId, delta) {
        const org = await this.findOne(organizationId);
        if (delta > 0 && org.userCount >= org.maxUsers && org.maxUsers !== -1) {
            throw new common_1.BadRequestException('用户数量已达上限，请升级套餐');
        }
        org.userCount += delta;
        await this.organizationRepository.save(org);
    }
    async updateBrandCount(organizationId, delta) {
        const org = await this.findOne(organizationId);
        if (delta > 0 && org.brandCount >= org.maxBrands && org.maxBrands !== -1) {
            throw new common_1.BadRequestException('品牌数量已达上限，请升级套餐');
        }
        org.brandCount += delta;
        await this.organizationRepository.save(org);
    }
    getTierLimits(tier) {
        return TierLimits[tier];
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map