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
exports.CreateWorkflowDto = exports.WorkflowActionDto = exports.WorkflowConditionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const workflow_definition_entity_1 = require("../entities/workflow-definition.entity");
class WorkflowConditionDto {
}
exports.WorkflowConditionDto = WorkflowConditionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConditionDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConditionDto.prototype, "operator", void 0);
class WorkflowActionDto {
}
exports.WorkflowActionDto = WorkflowActionDto;
__decorate([
    (0, class_validator_1.IsEnum)(['sendNotification', 'rebuildIndex', 'triggerDiagnosis', 'updateKnowledge', 'callWebhook']),
    __metadata("design:type", String)
], WorkflowActionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkflowActionDto.prototype, "continueOnError", void 0);
class CreateWorkflowDto {
}
exports.CreateWorkflowDto = CreateWorkflowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(workflow_definition_entity_1.WorkflowTriggerType),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "triggerType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowConditionDto),
    __metadata("design:type", Array)
], CreateWorkflowDto.prototype, "conditions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowActionDto),
    __metadata("design:type", Array)
], CreateWorkflowDto.prototype, "actions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateWorkflowDto.prototype, "isEnabled", void 0);
//# sourceMappingURL=create-workflow.dto.js.map