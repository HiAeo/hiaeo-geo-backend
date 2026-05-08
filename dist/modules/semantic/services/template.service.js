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
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_template_entity_1 = require("../entities/content-template.entity");
let TemplateService = class TemplateService {
    constructor(templateRepository) {
        this.templateRepository = templateRepository;
    }
    async create(data) {
        const template = this.templateRepository.create(data);
        return this.templateRepository.save(template);
    }
    async findAll(userId) {
        const query = this.templateRepository.createQueryBuilder('template')
            .where('template.active = :active', { active: true });
        if (userId) {
            query.andWhere('template.userId = :userId', { userId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new common_1.NotFoundException(`模板ID ${id} 不存在`);
        }
        return template;
    }
    async applyTemplate(templateId, variables) {
        const template = await this.findOne(templateId);
        let content = template.content;
        for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
        return content;
    }
    async update(id, data) {
        const template = await this.findOne(id);
        Object.assign(template, data);
        return this.templateRepository.save(template);
    }
    async remove(id) {
        const template = await this.findOne(id);
        template.active = false;
        await this.templateRepository.save(template);
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_template_entity_1.ContentTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TemplateService);
//# sourceMappingURL=template.service.js.map