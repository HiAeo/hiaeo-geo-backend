import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package, PackageType } from '../entities/package.entity';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  async getPackages(type?: string) {
    const where = type ? { type: type as PackageType, isActive: true } : { isActive: true };
    return this.packageRepository.find({
      where,
      order: { sortOrder: 'ASC' },
    });
  }

  async getPackageById(id: string) {
    return this.packageRepository.findOne({ where: { id } });
  }

  async createPackage(data: Partial<Package>) {
    const pkg = this.packageRepository.create(data);
    return this.packageRepository.save(pkg);
  }
}
