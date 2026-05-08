import { Injectable } from '@nestjs/common';

export interface Brand {
  id: string;
  name: string;
  industry: string;
  website: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BrandService {
  private brands: Brand[] = [];

  async getList(): Promise<{ list: Brand[]; total: number }> {
    return { list: this.brands, total: this.brands.length };
  }

  async getById(id: string): Promise<Brand | null> {
    return this.brands.find(b => b.id === id) || null;
  }

  async create(data: Partial<Brand>): Promise<Brand> {
    const brand: Brand = {
      id: `brand_${Date.now()}`,
      name: data.name || '',
      industry: data.industry || '',
      website: data.website || '',
      description: data.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.brands.push(brand);
    return brand;
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand | null> {
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    this.brands[index] = { ...this.brands[index], ...data, updatedAt: new Date() };
    return this.brands[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) return false;
    
    this.brands.splice(index, 1);
    return true;
  }
}
