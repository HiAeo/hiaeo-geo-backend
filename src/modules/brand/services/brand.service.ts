import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { Brand, BrandStatus } from '../entities/brand.entity';
import { Organization } from '../../user/entities/organization.entity';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from '../dto/brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
  ) {}

  /**
   * 获取品牌列表（支持分页、筛选）
   */
  async getList(query: BrandQueryDto, userId: string, organizationId: string): Promise<{
    list: Brand[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { keyword, industry, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Brand> = {
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
      queryBuilder = queryBuilder.andWhere(
        '(brand.name LIKE :keyword OR brand.domain LIKE :keyword OR brand.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
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

  /**
   * 获取单个品牌详情
   */
  async getById(id: string, organizationId: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id, organizationId },
      relations: ['user'],
    });

    if (!brand) {
      throw new NotFoundException('品牌不存在');
    }

    return brand;
  }

  /**
   * 创建品牌
   */
  async create(dto: CreateBrandDto, userId: string, organizationId: string): Promise<Brand> {
    // 检查组织是否有权限创建更多品牌
    const organization = await this.orgRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('组织不存在');
    }

    if (organization.brandCount >= organization.maxBrands) {
      throw new BadRequestException(`品牌数量已达上限（${organization.maxBrands}个），请升级套餐`);
    }

    // 检查域名是否已被使用
    const existingBrand = await this.brandRepository.findOne({
      where: { domain: dto.domain },
    });

    if (existingBrand) {
      throw new BadRequestException('该域名已被其他品牌使用');
    }

    // 创建品牌
    const brand = this.brandRepository.create({
      ...dto,
      userId,
      organizationId,
      status: BrandStatus.ACTIVE,
    });

    const savedBrand = await this.brandRepository.save(brand);

    // 更新组织的品牌计数
    await this.orgRepository.increment({ id: organizationId }, 'brandCount', 1);

    return savedBrand;
  }

  /**
   * 更新品牌
   */
  async update(id: string, dto: UpdateBrandDto, organizationId: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id, organizationId },
    });

    if (!brand) {
      throw new NotFoundException('品牌不存在');
    }

    // 如果更新域名，检查是否与其他品牌冲突
    if (dto.domain && dto.domain !== brand.domain) {
      const existingBrand = await this.brandRepository.findOne({
        where: { domain: dto.domain },
      });

      if (existingBrand && existingBrand.id !== id) {
        throw new BadRequestException('该域名已被其他品牌使用');
      }
    }

    Object.assign(brand, dto);
    return this.brandRepository.save(brand);
  }

  /**
   * 删除品牌（软删除）
   */
  async delete(id: string, organizationId: string): Promise<boolean> {
    const brand = await this.brandRepository.findOne({
      where: { id, organizationId },
    });

    if (!brand) {
      throw new NotFoundException('品牌不存在');
    }

    // 软删除 - 将状态改为 archived
    brand.status = BrandStatus.ARCHIVED;
    await this.brandRepository.save(brand);

    // 更新组织的品牌计数
    await this.orgRepository.decrement({ id: organizationId }, 'brandCount', 1);

    return true;
  }

  /**
   * 永久删除品牌（仅管理员）
   */
  async hardDelete(id: string, organizationId: string): Promise<boolean> {
    const brand = await this.brandRepository.findOne({
      where: { id, organizationId },
    });

    if (!brand) {
      throw new NotFoundException('品牌不存在');
    }

    await this.brandRepository.remove(brand);

    // 更新组织的品牌计数
    await this.orgRepository.decrement({ id: organizationId }, 'brandCount', 1);

    return true;
  }

  /**
   * 获取用户的所有品牌
   */
  async getByUser(userId: string): Promise<Brand[]> {
    return this.brandRepository.find({
      where: { userId, status: BrandStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 检查品牌访问权限
   */
  async checkAccess(brandId: string, organizationId: string): Promise<boolean> {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId, organizationId },
    });
    return !!brand;
  }

  /**
   * 获取品牌的SEO数据
   */
  async getSeoData(brandId: string, organizationId: string): Promise<Brand['seoData']> {
    const brand = await this.getById(brandId, organizationId);
    return brand.seoData;
  }

  /**
   * 更新品牌的SEO数据
   */
  async updateSeoData(brandId: string, seoData: Brand['seoData'], organizationId: string): Promise<Brand> {
    const brand = await this.getById(brandId, organizationId);
    brand.seoData = seoData;
    return this.brandRepository.save(brand);
  }

  /**
   * 获取品牌的社交媒体配置
   */
  async getSocialMedia(brandId: string, organizationId: string): Promise<{
    weibo?: string;
    wechat?: string;
    zhihu?: string;
    douyin?: string;
  }> {
    const brand = await this.getById(brandId, organizationId);
    return brand.seoData?.socialMedia || {};
  }

  /**
   * 更新品牌的社交媒体配置
   */
  async updateSocialMedia(
    brandId: string,
    socialMedia: { weibo?: string; wechat?: string; zhihu?: string; douyin?: string },
    organizationId: string,
  ): Promise<Brand> {
    const brand = await this.getById(brandId, organizationId);
    brand.seoData = {
      ...brand.seoData,
      socialMedia,
    };
    return this.brandRepository.save(brand);
  }

  /**
   * 获取品牌统计信息
   */
  async getStats(organizationId: string): Promise<{
    total: number;
    active: number;
    archived: number;
    byIndustry: Record<string, number>;
  }> {
    const brands = await this.brandRepository.find({
      where: { organizationId },
    });

    const stats = {
      total: brands.length,
      active: 0,
      archived: 0,
      byIndustry: {} as Record<string, number>,
    };

    brands.forEach(brand => {
      if (brand.status === BrandStatus.ACTIVE) {
        stats.active++;
      } else if (brand.status === BrandStatus.ARCHIVED) {
        stats.archived++;
      }

      if (brand.industry) {
        stats.byIndustry[brand.industry] = (stats.byIndustry[brand.industry] || 0) + 1;
      }
    });

    return stats;
  }
}
