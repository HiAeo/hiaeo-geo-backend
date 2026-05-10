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
exports.WorkflowDefinition = exports.WorkflowTriggerType = void 0;
const typeorm_1 = require("typeorm");
var WorkflowTriggerType;
(function (WorkflowTriggerType) {
    WorkflowTriggerType["KNOWLEDGE_UPDATED"] = "KNOWLEDGE_UPDATED";
    WorkflowTriggerType["DIAGNOSIS_COMPLETED"] = "DIAGNOSIS_COMPLETED";
    WorkflowTriggerType["INDEX_REBUILT"] = "INDEX_REBUILT";
    WorkflowTriggerType["SCHEDULED"] = "SCHEDULED";
})(WorkflowTriggerType || (exports.WorkflowTriggerType = WorkflowTriggerType = {}));
let WorkflowDefinition = class WorkflowDefinition {
};
exports.WorkflowDefinition = WorkflowDefinition;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkflowDefinition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], WorkflowDefinition.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], WorkflowDefinition.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkflowDefinition.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: WorkflowTriggerType }),
    __metadata("design:type", String)
], WorkflowDefinition.prototype, "triggerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], WorkflowDefinition.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], WorkflowDefinition.prototype, "actions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], WorkflowDefinition.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkflowDefinition.prototype, "executionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], WorkflowDefinition.prototype, "lastExecutedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WorkflowDefinition.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WorkflowDefinition.prototype, "updatedAt", void 0);
exports.WorkflowDefinition = WorkflowDefinition = __decorate([
    (0, typeorm_1.Entity)('workflow_definitions'),
    (0, typeorm_1.Index)(['organizationId', 'isEnabled']),
    (0, typeorm_1.Index)(['triggerType'])
], WorkflowDefinition);
//# sourceMappingURL=workflow-definition.entity.js.map