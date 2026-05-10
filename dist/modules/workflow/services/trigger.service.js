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
var TriggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerService = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_service_1 = require("./workflow-engine.service");
const workflow_definition_entity_1 = require("../entities/workflow-definition.entity");
let TriggerService = TriggerService_1 = class TriggerService {
    constructor(workflowEngine) {
        this.workflowEngine = workflowEngine;
        this.logger = new common_1.Logger(TriggerService_1.name);
    }
    async onKnowledgeUpdated(organizationId, knowledgeId, metadata) {
        this.logger.log(`Knowledge updated trigger: ${knowledgeId}`);
        await this.workflowEngine.handleTrigger(workflow_definition_entity_1.WorkflowTriggerType.KNOWLEDGE_UPDATED, {
            organizationId,
            knowledgeId,
            ...metadata,
        });
    }
    async onDiagnosisCompleted(organizationId, knowledgeId, score, reportId) {
        this.logger.log(`Diagnosis completed trigger: ${knowledgeId}, score: ${score}`);
        await this.workflowEngine.handleTrigger(workflow_definition_entity_1.WorkflowTriggerType.DIAGNOSIS_COMPLETED, {
            organizationId,
            knowledgeId,
            score,
            reportId,
        });
    }
    async onIndexRebuilt(organizationId, knowledgeId, indexType) {
        this.logger.log(`Index rebuilt trigger: ${knowledgeId}`);
        await this.workflowEngine.handleTrigger(workflow_definition_entity_1.WorkflowTriggerType.INDEX_REBUILT, {
            organizationId,
            knowledgeId,
            indexType,
        });
    }
    async onScheduled(organizationId, cronExpression, metadata) {
        this.logger.log(`Scheduled trigger: ${cronExpression}`);
        await this.workflowEngine.handleTrigger(workflow_definition_entity_1.WorkflowTriggerType.SCHEDULED, {
            organizationId,
            cronExpression,
            ...metadata,
        });
    }
    async onManual(workflowId, organizationId, context) {
        this.logger.log(`Manual trigger: ${workflowId}`);
        await this.workflowEngine.execute(workflowId, {
            ...context,
            organizationId,
            triggeredBy: 'manual',
        });
    }
};
exports.TriggerService = TriggerService;
exports.TriggerService = TriggerService = TriggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngine])
], TriggerService);
//# sourceMappingURL=trigger.service.js.map