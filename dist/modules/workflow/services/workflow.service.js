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
var WorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workflow_definition_entity_1 = require("../entities/workflow-definition.entity");
let WorkflowService = WorkflowService_1 = class WorkflowService {
    constructor(workflowRepo) {
        this.workflowRepo = workflowRepo;
        this.logger = new common_1.Logger(WorkflowService_1.name);
    }
    async create(organizationId, dto) {
        const workflow = this.workflowRepo.create({
            ...dto,
            organizationId,
            isEnabled: dto.isEnabled ?? true,
        });
        await this.workflowRepo.save(workflow);
        this.logger.log(`Created workflow: ${workflow.id}`);
        return workflow;
    }
    async update(id, dto) {
        const workflow = await this.workflowRepo.findOne({ where: { id } });
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow not found: ${id}`);
        }
        Object.assign(workflow, dto);
        await this.workflowRepo.save(workflow);
        this.logger.log(`Updated workflow: ${id}`);
        return workflow;
    }
    async delete(id) {
        const workflow = await this.workflowRepo.findOne({ where: { id } });
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow not found: ${id}`);
        }
        await this.workflowRepo.remove(workflow);
        this.logger.log(`Deleted workflow: ${id}`);
    }
    async findById(id) {
        const workflow = await this.workflowRepo.findOne({ where: { id } });
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow not found: ${id}`);
        }
        return workflow;
    }
    async findByOrganization(organizationId, options) {
        const where = { organizationId };
        if (options?.triggerType) {
            where.triggerType = options.triggerType;
        }
        if (options?.isEnabled !== undefined) {
            where.isEnabled = options.isEnabled;
        }
        const [items, total] = await this.workflowRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take: options?.limit || 20,
            skip: options?.offset || 0,
        });
        return { items, total };
    }
    async toggleEnabled(id, isEnabled) {
        const workflow = await this.findById(id);
        workflow.isEnabled = isEnabled;
        await this.workflowRepo.save(workflow);
        return workflow;
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = WorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workflow_definition_entity_1.WorkflowDefinition)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map