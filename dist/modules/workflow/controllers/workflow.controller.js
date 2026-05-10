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
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const workflow_service_1 = require("../services/workflow.service");
const workflow_engine_service_1 = require("../services/workflow-engine.service");
const dto_1 = require("../dto");
const entities_1 = require("../entities");
let WorkflowController = class WorkflowController {
    constructor(workflowService, workflowEngine) {
        this.workflowService = workflowService;
        this.workflowEngine = workflowEngine;
    }
    async create(dto, organizationId) {
        return this.workflowService.create(organizationId, dto);
    }
    async findAll(organizationId, triggerType, isEnabled, limit, offset) {
        return this.workflowService.findByOrganization(organizationId, {
            triggerType,
            isEnabled: isEnabled !== undefined ? isEnabled === 'true' : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        });
    }
    async findById(id) {
        return this.workflowService.findById(id);
    }
    async update(id, dto) {
        return this.workflowService.update(id, dto);
    }
    async delete(id) {
        await this.workflowService.delete(id);
    }
    async execute(id, organizationId, context) {
        return this.workflowEngine.execute(id, {
            organizationId,
            triggeredBy: 'manual',
            ...context,
        });
    }
    async getExecutionHistory(organizationId, workflowId, status, limit, offset) {
        return this.workflowEngine.getExecutionHistory(organizationId, {
            workflowId,
            status,
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        });
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateWorkflowDto, String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('triggerType')),
    __param(2, (0, common_1.Query)('isEnabled')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateWorkflowDto]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('organizationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "execute", null);
__decorate([
    (0, common_1.Get)('executions/history'),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('workflowId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getExecutionHistory", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, common_1.Controller)('v1/workflow'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService,
        workflow_engine_service_1.WorkflowEngine])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map