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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_entity_1 = require("../entities/content.entity");
let ContentService = class ContentService {
    constructor(contentRepository) {
        this.contentRepository = contentRepository;
    }
    async create(createContentDto, userId) {
        const content = this.contentRepository.create({
            ...createContentDto,
            userId,
        });
        return this.contentRepository.save(content);
    }
    async findAll(query) {
        const queryBuilder = this.contentRepository.createQueryBuilder('content');
        if (query.keyword) {
            queryBuilder.andWhere('content.title LIKE :keyword', {
                keyword: `%${query.keyword}%`,
            });
        }
        if (query.type) {
            queryBuilder.andWhere('content.type = :type', { type: query.type });
        }
        if (query.status) {
            queryBuilder.andWhere('content.status = :status', { status: query.status });
        }
        queryBuilder.orderBy('content.createdAt', 'DESC');
        if (query.page && query.limit) {
            queryBuilder.skip((query.page - 1) * query.limit).take(query.limit);
        }
        return queryBuilder.getMany();
    }
    async findOne(id) {
        const content = await this.contentRepository.findOne({ where: { id } });
        if (!content) {
            throw new common_1.NotFoundException(`内容ID ${id} 不存在`);
        }
        return content;
    }
    async update(id, updateData) {
        const content = await this.findOne(id);
        Object.assign(content, updateData);
        return this.contentRepository.save(content);
    }
    async remove(id) {
        const content = await this.findOne(id);
        await this.contentRepository.remove(content);
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContentService);
//# sourceMappingURL=content.service.js.map