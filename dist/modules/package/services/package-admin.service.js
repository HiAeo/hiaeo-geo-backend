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
exports.PackageAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const package_entity_1 = require("../entities/package.entity");
let PackageAdminService = class PackageAdminService {
    constructor(packageRepository) {
        this.packageRepository = packageRepository;
    }
    async getAllPackages(includeArchived = false) {
        const where = includeArchived ? {} : { status: package_entity_1.PackageStatus.ACTIVE };
        return this.packageRepository.find({
            where,
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    async getPackageById(id) {
        const pkg = await this.packageRepository.findOne({ where: { id } });
        if (!pkg) {
            throw new common_1.NotFoundException(`套餐 ${id} 不存在`);
        }
        return pkg;
    }
    async createPackage(dto, userId) {
        const existing = await this.packageRepository.findOne({ where: { name: dto.name } });
        if (existing) {
            throw new common_1.BadRequestException(`套餐名称 "${dto.name}" 已存在`);
        }
        const pkg = this.packageRepository.create({
            ...dto,
            features: JSON.stringify(dto.features || []),
            status: package_entity_1.PackageStatus.ACTIVE,
            createdBy: userId,
        });
        return this.packageRepository.save(pkg);
    }
    async updatePackage(id, dto) {
        const pkg = await this.getPackageById(id);
        if (dto.name && dto.name !== pkg.name) {
            const existing = await this.packageRepository.findOne({ where: { name: dto.name } });
            if (existing) {
                throw new common_1.BadRequestException(`套餐名称 "${dto.name}" 已存在`);
            }
        }
        if (dto.features !== undefined) {
            dto.features = JSON.stringify(dto.features);
        }
        Object.assign(pkg, dto);
        return this.packageRepository.save(pkg);
    }
    async deletePackage(id) {
        const pkg = await this.getPackageById(id);
        pkg.status = package_entity_1.PackageStatus.ARCHIVED;
        await this.packageRepository.save(pkg);
        return { success: true, message: '套餐已归档' };
    }
    async hardDeletePackage(id) {
        const pkg = await this.getPackageById(id);
        await this.packageRepository.remove(pkg);
        return { success: true, message: '套餐已永久删除' };
    }
    async updatePackageStatus(id, status) {
        const pkg = await this.getPackageById(id);
        pkg.status = status;
        return this.packageRepository.save(pkg);
    }
    async setRecommended(id, recommended) {
        if (recommended) {
            await this.packageRepository.update({ isRecommended: true }, { isRecommended: false });
        }
        const pkg = await this.getPackageById(id);
        pkg.isRecommended = recommended;
        return this.packageRepository.save(pkg);
    }
    async reorderPackages(orderedIds) {
        for (let i = 0; i < orderedIds.length; i++) {
            await this.packageRepository.update(orderedIds[i], { sortOrder: i });
        }
        return this.getAllPackages();
    }
    async duplicatePackage(id, newName) {
        const original = await this.getPackageById(id);
        const duplicate = this.packageRepository.create({
            name: newName,
            displayName: `${original.displayName} (副本)`,
            description: original.description,
            features: original.features,
            type: original.type,
            price: original.price,
            originalPrice: original.originalPrice,
            billingCycle: original.billingCycle,
            billingCycles: original.billingCycles,
            diagnosisLimit: original.diagnosisLimit,
            reportLimit: original.reportLimit,
            aiEngineLimit: original.aiEngineLimit,
            contentLimit: original.contentLimit,
            brandLimit: original.brandLimit,
            teamMemberLimit: original.teamMemberLimit,
            apiAccess: original.apiAccess,
            prioritySupport: original.prioritySupport,
            customBranding: original.customBranding,
            isTrial: false,
            trialDays: 0,
            isRecommended: false,
            sortOrder: original.sortOrder + 1,
        });
        return this.packageRepository.save(duplicate);
    }
    async getPackageStats() {
        const packages = await this.packageRepository.find();
        const stats = {
            total: packages.length,
            active: packages.filter(p => p.status === package_entity_1.PackageStatus.ACTIVE).length,
            archived: packages.filter(p => p.status === package_entity_1.PackageStatus.ARCHIVED).length,
            byType: {},
            avgPrice: 0,
        };
        Object.values(package_entity_1.PackageType).forEach(type => {
            stats.byType[type] = packages.filter(p => p.type === type).length;
        });
        const activePackages = packages.filter(p => p.status === package_entity_1.PackageStatus.ACTIVE);
        if (activePackages.length > 0) {
            stats.avgPrice = activePackages.reduce((sum, p) => sum + Number(p.price), 0) / activePackages.length;
        }
        return stats;
    }
};
exports.PackageAdminService = PackageAdminService;
exports.PackageAdminService = PackageAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(package_entity_1.Package)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PackageAdminService);
//# sourceMappingURL=package-admin.service.js.map