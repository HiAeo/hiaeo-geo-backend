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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecution = exports.WorkflowExecutionStatus = void 0;
const typeorm_1 = require("typeorm");
const workflow_definition_entity_1 = require("./workflow-definition.entity");
var WorkflowExecutionStatus;
(function (WorkflowExecutionStatus) {
    WorkflowExecutionStatus["PENDING"] = "PENDING";
    WorkflowExecutionStatus["RUNNING"] = "RUNNING";
    WorkflowExecutionStatus["SUCCESS"] = "SUCCESS";
    WorkflowExecutionStatus["FAILED"] = "FAILED";
    WorkflowExecutionStatus["CANCELLED"] = "CANCELLED";
})(WorkflowExecutionStatus || (exports.WorkflowExecutionStatus = WorkflowExecutionStatus = {}));
let WorkflowExecution = class WorkflowExecution {
};
exports.WorkflowExecution = WorkflowExecution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_definition_entity_1.WorkflowDefinition, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workflowId' }),
    __metadata("design:type", workflow_definition_entity_1.WorkflowDefinition)
], WorkflowExecution.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: WorkflowExecutionStatus, default: WorkflowExecutionStatus.PENDING }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "triggerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "triggeredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], WorkflowExecution.prototype, "actionResults", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "createdAt", void 0);
exports.WorkflowExecution = WorkflowExecution = __decorate([
    (0, typeorm_1.Entity)('workflow_executions'),
    (0, typeorm_1.Index)(['workflowId', 'startedAt']),
    (0, typeorm_1.Index)(['organizationId', 'startedAt']),
    (0, typeorm_1.Index)(['status'])
], WorkflowExecution);
//# sourceMappingURL=workflow-execution.entity.js.map