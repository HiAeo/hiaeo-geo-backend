"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandService = void 0;
const common_1 = require("@nestjs/common");
let BrandService = class BrandService {
    constructor() {
        this.brands = [];
    }
    async getList() {
        return { list: this.brands, total: this.brands.length };
    }
    async getById(id) {
        return this.brands.find(b => b.id === id) || null;
    }
    async create(data) {
        const brand = {
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
    async update(id, data) {
        const index = this.brands.findIndex(b => b.id === id);
        if (index === -1)
            return null;
        this.brands[index] = { ...this.brands[index], ...data, updatedAt: new Date() };
        return this.brands[index];
    }
    async delete(id) {
        const index = this.brands.findIndex(b => b.id === id);
        if (index === -1)
            return false;
        this.brands.splice(index, 1);
        return true;
    }
};
exports.BrandService = BrandService;
exports.BrandService = BrandService = __decorate([
    (0, common_1.Injectable)()
], BrandService);
//# sourceMappingURL=brand.service.js.map