import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package, PackageType, PackageStatus, BillingCycle } from '../entities/package.entity';

export interface CreatePackageDto {
  name: string;
  displayName: string;
  description?: string;
  features?: string[];
  type: PackageType;
  price: number;
  originalPrice?: number;
  billingCycle: BillingCycle;
  billingCycles?: Array<{ cycle: BillingCycle; price: number; discount?: number }>;
  diagnosisLimit: number;
  reportLimit?: number;
  aiEngineLimit?: number;
  contentLimit?: number;
  brandLimit?: number;
  teamMemberLimit?: number;
  apiAccess?: boolean;
  prioritySupport?: boolean;
  customBranding?: boolean;
  isTrial?: boolean;
  trialDays?: number;
  isRecommended?: boolean;
  sortOrder?: number;
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {
  status?: PackageStatus;
}

@Injectable()
export class PackageAdminService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  /**
   * 获取所有套餐（管理员视图）
   */
  async getAllPackages(includeArchived = false): Promise<Package[]> {
    const where = includeArchived ? {} : { status: PackageStatus.ACTIVE };
    return this.packageRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取套餐详情
   */
  async getPackageById(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException(`套餐 ${id} 不存在`);
    }
    return pkg;
  }

  /**
   * 创建套餐
   */
  async createPackage(dto: CreatePackageDto, userId?: string): Promise<Package> {
    // 检查同名套餐
    const existing = await this.packageRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`套餐名称 "${dto.name}" 已存在`);
    }

    const pkg = this.packageRepository.create({
      ...dto,
      features: JSON.stringify(dto.features || []),
      status: PackageStatus.ACTIVE,
      createdBy: userId,
    });

    return this.packageRepository.save(pkg);
  }

  /**
   * 更新套餐
   */
  async updatePackage(id: string, dto: UpdatePackageDto): Promise<Package> {
    const pkg = await this.getPackageById(id);

    // 如果更新名称，检查是否冲突
    if (dto.name && dto.name !== pkg.name) {
      const existing = await this.packageRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new BadRequestException(`套餐名称 "${dto.name}" 已存在`);
      }
    }

    // 处理features数组
    if (dto.features !== undefined) {
      dto.features = JSON.stringify(dto.features) as any;
    }

    Object.assign(pkg, dto);
    return this.packageRepository.save(pkg);
  }

  /**
   * 删除套餐（软删除）
   */
  async deletePackage(id: string): Promise<{ success: boolean; message: string }> {
    const pkg = await this.getPackageById(id);
    
    // 检查是否有用户正在使用此套餐
    // TODO: 检查订阅表

    pkg.status = PackageStatus.ARCHIVED;
    await this.packageRepository.save(pkg);

    return { success: true, message: '套餐已归档' };
  }

  /**
   * 永久删除套餐
   */
  async hardDeletePackage(id: string): Promise<{ success: boolean; message: string }> {
    const pkg = await this.getPackageById(id);
    await this.packageRepository.remove(pkg);
    return { success: true, message: '套餐已永久删除' };
  }

  /**
   * 更新套餐状态
   */
  async updatePackageStatus(id: string, status: PackageStatus): Promise<Package> {
    const pkg = await this.getPackageById(id);
    pkg.status = status;
    return this.packageRepository.save(pkg);
  }

  /**
   * 设置推荐套餐
   */
  async setRecommended(id: string, recommended: boolean): Promise<Package> {
    if (recommended) {
      // 取消其他推荐
      await this.packageRepository.update(
        { isRecommended: true },
        { isRecommended: false },
      );
    }

    const pkg = await this.getPackageById(id);
    pkg.isRecommended = recommended;
    return this.packageRepository.save(pkg);
  }

  /**
   * 排序套餐
   */
  async reorderPackages(orderedIds: string[]): Promise<Package[]> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.packageRepository.update(orderedIds[i], { sortOrder: i });
    }
    return this.getAllPackages();
  }

  /**
   * 复制套餐
   */
  async duplicatePackage(id: string, newName: string): Promise<Package> {
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

  /**
   * 获取套餐统计
   */
  async getPackageStats(): Promise<{
    total: number;
    active: number;
    archived: number;
    byType: Record<PackageType, number>;
    avgPrice: number;
  }> {
    const packages = await this.packageRepository.find();

    const stats = {
      total: packages.length,
      active: packages.filter(p => p.status === PackageStatus.ACTIVE).length,
      archived: packages.filter(p => p.status === PackageStatus.ARCHIVED).length,
      byType: {} as Record<PackageType, number>,
      avgPrice: 0,
    };

    Object.values(PackageType).forEach(type => {
      stats.byType[type] = packages.filter(p => p.type === type).length;
    });

    const activePackages = packages.filter(p => p.status === PackageStatus.ACTIVE);
    if (activePackages.length > 0) {
      stats.avgPrice = activePackages.reduce((sum, p) => sum + Number(p.price), 0) / activePackages.length;
    }

    return stats;
  }
}
