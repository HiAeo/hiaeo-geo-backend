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
exports.BrandService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_entity_1 = require("../entities/brand.entity");
const organization_entity_1 = require("../../user/entities/organization.entity");
let BrandService = class BrandService {
    constructor(brandRepository, orgRepository) {
        this.brandRepository = brandRepository;
        this.orgRepository = orgRepository;
    }
    async getList(query, userId, organizationId) {
        const { keyword, industry, status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
        };
        if (status) {
            where.status = status;
        }
        if (industry) {
            where.industry = industry;
        }
        let queryBuilder = this.brandRepository
            .createQueryBuilder('brand')
            .where('brand.organizationId = :organizationId', { organizationId });
        if (status) {
            queryBuilder = queryBuilder.andWhere('brand.status = :status', { status });
        }
        if (industry) {
            queryBuilder = queryBuilder.andWhere('brand.industry = :industry', { industry });
        }
        if (keyword) {
            queryBuilder = queryBuilder.andWhere('(brand.name LIKE :keyword OR brand.domain LIKE :keyword OR brand.description LIKE :keyword)', { keyword: `%${keyword}%` });
        }
        const [list, total] = await queryBuilder
            .orderBy('brand.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            list,
            total,
            page,
            limit,
        };
    }
    async getById(id, organizationId) {
        const brand = await this.brandRepository.findOne({
            where: { id, organizationId },
            relations: ['user'],
        });
        if (!brand) {
            throw new common_1.NotFoundException('品牌不存在');
        }
        return brand;
    }
    async create(dto, userId, organizationId) {
        const organization = await this.orgRepository.findOne({
            where: { id: organizationId },
        });
        if (!organization) {
            throw new common_1.NotFoundException('组织不存在');
        }
        if (organization.brandCount >= organization.maxBrands) {
            throw new common_1.BadRequestException(`品牌数量已达上限（${organization.maxBrands}个），请升级套餐`);
        }
        const existingBrand = await this.brandRepository.findOne({
            where: { domain: dto.domain },
        });
        if (existingBrand) {
            throw new common_1.BadRequestException('该域名已被其他品牌使用');
        }
        const brand = this.brandRepository.create({
            ...dto,
            userId,
            organizationId,
            status: brand_entity_1.BrandStatus.ACTIVE,
        });
        const savedBrand = await this.brandRepository.save(brand);
        await this.orgRepository.increment({ id: organizationId }, 'brandCount', 1);
        return savedBrand;
    }
    async update(id, dto, organizationId) {
        const brand = await this.brandRepository.findOne({
            where: { id, organizationId },
        });
        if (!brand) {
            throw new common_1.NotFoundException('品牌不存在');
        }
        if (dto.domain && dto.domain !== brand.domain) {
            const existingBrand = await this.brandRepository.findOne({
                where: { domain: dto.domain },
            });
            if (existingBrand && existingBrand.id !== id) {
                throw new common_1.BadRequestException('该域名已被其他品牌使用');
            }
        }
        Object.assign(brand, dto);
        return this.brandRepository.save(brand);
    }
    async delete(id, organizationId) {
        const brand = await this.brandRepository.findOne({
            where: { id, organizationId },
        });
        if (!brand) {
            throw new common_1.NotFoundException('品牌不存在');
        }
        brand.status = brand_entity_1.BrandStatus.ARCHIVED;
        await this.brandRepository.save(brand);
        await this.orgRepository.decrement({ id: organizationId }, 'brandCount', 1);
        return true;
    }
    async hardDelete(id, organizationId) {
        const brand = await this.brandRepository.findOne({
            where: { id, organizationId },
        });
        if (!brand) {
            throw new common_1.NotFoundException('品牌不存在');
        }
        await this.brandRepository.remove(brand);
        await this.orgRepository.decrement({ id: organizationId }, 'brandCount', 1);
        return true;
    }
    async getByUser(userId) {
        return this.brandRepository.find({
            where: { userId, status: brand_entity_1.BrandStatus.ACTIVE },
            order: { createdAt: 'DESC' },
        });
    }
    async checkAccess(brandId, organizationId) {
        const brand = await this.brandRepository.findOne({
            where: { id: brandId, organizationId },
        });
        return !!brand;
    }
    async getSeoData(brandId, organizationId) {
        const brand = await this.getById(brandId, organizationId);
        return brand.seoData;
    }
    async updateSeoData(brandId, seoData, organizationId) {
        const brand = await this.getById(brandId, organizationId);
        brand.seoData = seoData;
        return this.brandRepository.save(brand);
    }
    async getSocialMedia(brandId, organizationId) {
        const brand = await this.getById(brandId, organizationId);
        return brand.seoData?.socialMedia || {};
    }
    async updateSocialMedia(brandId, socialMedia, organizationId) {
        const brand = await this.getById(brandId, organizationId);
        brand.seoData = {
            ...brand.seoData,
            socialMedia,
        };
        return this.brandRepository.save(brand);
    }
    async getStats(organizationId) {
        const brands = await this.brandRepository.find({
            where: { organizationId },
        });
        const stats = {
            total: brands.length,
            active: 0,
            archived: 0,
            byIndustry: {},
        };
        brands.forEach(brand => {
            if (brand.status === brand_entity_1.BrandStatus.ACTIVE) {
                stats.active++;
            }
            else if (brand.status === brand_entity_1.BrandStatus.ARCHIVED) {
                stats.archived++;
            }
            if (brand.industry) {
                stats.byIndustry[brand.industry] = (stats.byIndustry[brand.industry] || 0) + 1;
            }
        });
        return stats;
    }
};
exports.BrandService = BrandService;
exports.BrandService = BrandService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BrandService);
//# sourceMappingURL=brand.service.js.map